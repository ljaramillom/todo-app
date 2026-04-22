import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { TaskService } from '@features/tasks/data-access/task.service';
import {
  CreateTaskRequestDto,
  TaskListQueryParams,
  UpdateTaskRequestDto
} from '@features/tasks/data-access/task.dto';
import { Task, TaskFilters } from '../../shared/models/task.model';

interface TaskState {
  tasks: Task[];
  pendingTasks: Task[];
  overdueTasks: Task[];
  pendingTotal: number;
  overdueTotal: number;
  filters: TaskFilters;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  loading: boolean;
  mutating: boolean;
  error: string | null;
}

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'ALL'
};

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly document = inject(DOCUMENT);
  private readonly taskService = inject(TaskService);
  private readonly storageKey = 'todo-app.task-filters';

  private readonly state = signal<TaskState>({
    tasks: [],
    pendingTasks: [],
    overdueTasks: [],
    pendingTotal: 0,
    overdueTotal: 0,
    filters: this.readStoredFilters(),
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    loading: false,
    mutating: false,
    error: null
  });

  readonly tasks = computed(() => this.state().tasks);
  readonly pendingTasks = computed(() => this.state().pendingTasks);
  readonly overdueTasks = computed(() => this.state().overdueTasks);
  readonly pendingTotal = computed(() => this.state().pendingTotal);
  readonly overdueTotal = computed(() => this.state().overdueTotal);
  readonly filters = computed(() => this.state().filters);
  readonly loading = computed(() => this.state().loading);
  readonly mutating = computed(() => this.state().mutating);
  readonly error = computed(() => this.state().error);
  readonly page = computed(() => this.state().page);
  readonly size = computed(() => this.state().size);
  readonly totalElements = computed(() => this.state().totalElements);
  readonly totalPages = computed(() => this.state().totalPages);

  readonly visibleTasks = computed(() => {
    const { search, status } = this.filters();
    const normalizedSearch = search.trim().toLowerCase();

    return this.tasks().filter((task) => {
      const matchesStatus = status === 'ALL' || task.status === status;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        (task.description ?? '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  });

  readonly totalTasks = computed(() => this.tasks().length);
  readonly pendingTasksCount = computed(() => this.pendingTotal());
  readonly completedTasksCount = computed(() =>
    this.tasks().filter((task) => task.status === 'FINALIZADA').length
  );
  readonly overdueTasksCount = computed(() => this.overdueTotal());
  readonly hasActiveFilters = computed(() => {
    const { search, status } = this.filters();
    return search.trim().length > 0 || status !== 'ALL';
  });

  private readonly persistFiltersEffect = effect(() => {
    const filters = this.filters();
    this.document.defaultView?.localStorage.setItem(this.storageKey, JSON.stringify(filters));
  });

  /**
   * Si `updateListSlice` es false, solo sincroniza `totalElements` (p. ej. contador del dashboard con size mínimo)
   * sin tocar `tasks`, `page`, `size` ni `totalPages` del listado principal.
   */
  async loadTasks(
    overrides: Partial<TaskListQueryParams> = {},
    options: { updateListSlice?: boolean } = {}
  ): Promise<void> {
    const updateListSlice = options.updateListSlice !== false;
    const current = this.state();
    const query = this.buildListQuery(current, overrides);

    this.state.update((value) => ({ ...value, loading: true, error: null }));

    try {
      const pageResponse = await firstValueFrom(this.taskService.listTasks(query));
      if (updateListSlice) {
        this.state.update((value) => ({
          ...value,
          tasks: pageResponse.content,
          page: pageResponse.number,
          size: pageResponse.size,
          totalElements: pageResponse.totalElements,
          totalPages: pageResponse.totalPages
        }));
      } else {
        this.state.update((value) => ({
          ...value,
          totalElements: pageResponse.totalElements
        }));
      }
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudieron cargar las tareas.'
      }));
    } finally {
      this.state.update((value) => ({ ...value, loading: false }));
    }
  }

  async createTask(payload: CreateTaskRequestDto): Promise<Task | null> {
    this.state.update((value) => ({ ...value, mutating: true, error: null }));
    try {
      const createdTask = await firstValueFrom(this.taskService.createTask(payload));
      await this.loadTasks({ page: 0 });
      await this.refreshDashboardCollections();
      return createdTask;
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudo crear la tarea.'
      }));
      return null;
    } finally {
      this.state.update((value) => ({ ...value, mutating: false }));
    }
  }

  async loadTaskById(taskId: number): Promise<Task | null> {
    this.state.update((value) => ({ ...value, loading: true, error: null }));
    try {
      return await firstValueFrom(this.taskService.getTaskById(taskId));
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudo cargar la tarea solicitada.'
      }));
      return null;
    } finally {
      this.state.update((value) => ({ ...value, loading: false }));
    }
  }

  async updateTask(taskId: number, payload: UpdateTaskRequestDto): Promise<Task | null> {
    this.state.update((value) => ({ ...value, mutating: true, error: null }));
    try {
      const updatedTask = await firstValueFrom(this.taskService.updateTask(taskId, payload));
      this.upsertTaskInCollections(updatedTask);
      await this.refreshDashboardCollections();
      return updatedTask;
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudo actualizar la tarea.'
      }));
      return null;
    } finally {
      this.state.update((value) => ({ ...value, mutating: false }));
    }
  }

  async deleteTask(taskId: number): Promise<boolean> {
    this.state.update((value) => ({ ...value, mutating: true, error: null }));
    try {
      await firstValueFrom(this.taskService.deleteTask(taskId));
      this.removeTaskFromCollections(taskId);
      await this.loadTasks();
      await this.refreshDashboardCollections();
      return true;
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudo eliminar la tarea.'
      }));
      return false;
    } finally {
      this.state.update((value) => ({ ...value, mutating: false }));
    }
  }

  async toggleSubtask(subtaskId: number): Promise<boolean> {
    this.state.update((value) => ({ ...value, mutating: true, error: null }));
    try {
      const updatedSubtask = await firstValueFrom(this.taskService.toggleSubtask(subtaskId));
      this.patchSubtaskInCollections(updatedSubtask.id, updatedSubtask.completed);
      await this.refreshDashboardCollections();
      return true;
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudo actualizar la subtarea.'
      }));
      return false;
    } finally {
      this.state.update((value) => ({ ...value, mutating: false }));
    }
  }

  async findPending(size = 10): Promise<void> {
    try {
      const response = await firstValueFrom(this.taskService.findPending({ page: 0, size }));
      this.state.update((value) => ({
        ...value,
        pendingTasks: response.content,
        pendingTotal: response.totalElements
      }));
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudieron cargar las tareas pendientes.'
      }));
    }
  }

  async findOverdue(size = 10): Promise<void> {
    try {
      const response = await firstValueFrom(this.taskService.findOverdue({ page: 0, size }));
      this.state.update((value) => ({
        ...value,
        overdueTasks: response.content,
        overdueTotal: response.totalElements
      }));
    } catch {
      this.state.update((value) => ({
        ...value,
        error: 'No se pudieron cargar las tareas vencidas.'
      }));
    }
  }

  setFilters(filters: Partial<TaskFilters>): void {
    this.state.update((current) => ({
      ...current,
      filters: { ...current.filters, ...filters },
      page: 0
    }));
  }

  setPage(page: number): void {
    this.state.update((current) => ({
      ...current,
      page: Math.max(0, page)
    }));
  }

  setSize(size: number): void {
    this.state.update((current) => ({
      ...current,
      size: Math.max(1, size),
      page: 0
    }));
  }

  setError(error: string | null): void {
    this.state.update((current) => ({ ...current, error }));
  }

  private buildListQuery(state: TaskState, overrides: Partial<TaskListQueryParams>): TaskListQueryParams {
    const status = state.filters.status === 'ALL' ? undefined : state.filters.status;
    return {
      page: overrides.page ?? state.page,
      size: overrides.size ?? state.size,
      search: overrides.search ?? state.filters.search,
      status: overrides.status ?? status,
      overdue: overrides.overdue,
      pendingOnly: overrides.pendingOnly
    };
  }

  private async refreshDashboardCollections(): Promise<void> {
    await Promise.all([this.findPending(10), this.findOverdue(10)]);
  }

  private upsertTaskInCollections(task: Task): void {
    this.state.update((value) => ({
      ...value,
      tasks: this.upsertById(value.tasks, task),
      pendingTasks: this.upsertById(value.pendingTasks, task),
      overdueTasks: this.upsertById(value.overdueTasks, task)
    }));
  }

  private removeTaskFromCollections(taskId: number): void {
    this.state.update((value) => ({
      ...value,
      tasks: value.tasks.filter((task) => task.id !== taskId),
      pendingTasks: value.pendingTasks.filter((task) => task.id !== taskId),
      overdueTasks: value.overdueTasks.filter((task) => task.id !== taskId)
    }));
  }

  private upsertById(collection: Task[], task: Task): Task[] {
    const existingIndex = collection.findIndex((item) => item.id === task.id);
    if (existingIndex === -1) {
      return collection;
    }

    const updated = [...collection];
    updated[existingIndex] = task;
    return updated;
  }

  private patchSubtaskInCollections(subtaskId: number, completed: boolean): void {
    this.state.update((value) => ({
      ...value,
      tasks: this.patchSubtask(value.tasks, subtaskId, completed),
      pendingTasks: this.patchSubtask(value.pendingTasks, subtaskId, completed),
      overdueTasks: this.patchSubtask(value.overdueTasks, subtaskId, completed)
    }));
  }

  private patchSubtask(tasks: Task[], subtaskId: number, completed: boolean): Task[] {
    return tasks.map((task) => {
      const hasSubtask = task.subtasks.some((subtask) => subtask.id === subtaskId);
      if (!hasSubtask) {
        return task;
      }

      return {
        ...task,
        subtasks: task.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, completed } : subtask
        )
      };
    });
  }

  private readStoredFilters(): TaskFilters {
    const raw = this.document.defaultView?.localStorage.getItem(this.storageKey);
    if (!raw) {
      return DEFAULT_FILTERS;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<TaskFilters>;
      return {
        search: parsed.search ?? DEFAULT_FILTERS.search,
        status: parsed.status ?? DEFAULT_FILTERS.status
      };
    } catch {
      return DEFAULT_FILTERS;
    }
  }
}
