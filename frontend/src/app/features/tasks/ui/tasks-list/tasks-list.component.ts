import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskStore } from '@core/state/task.store';
import { Task, TaskStatus } from '@shared/models/task.model';
import { taskStatusLabel } from '@shared/utils/task-status-label';
import { UpdateTaskRequestDto } from '../../data-access/task.dto';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog/confirm-dialog.component';

type StatusFilterValue = TaskStatus | 'ALL';

@Component({
  selector: 'app-tasks-list',
  imports: [DatePipe, TaskFormComponent, TaskDetailComponent, ConfirmDialogComponent],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksListComponent {
  private readonly taskStore = inject(TaskStore);
  private readonly searchDebounceMs = 350;

  protected readonly statusLabel = taskStatusLabel;

  protected readonly searchTerm = signal(this.taskStore.filters().search);
  protected readonly statusFilter = signal<StatusFilterValue>(this.taskStore.filters().status);
  protected readonly pendingOnlyFilter = signal(false);
  protected readonly overdueFilter = signal(false);
  protected readonly formOpen = signal(false);
  protected readonly editingTaskId = signal<number | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly detailTaskId = signal<number | null>(null);
  protected readonly deleteConfirmOpen = signal(false);
  protected readonly taskPendingDelete = signal<Task | null>(null);

  protected readonly tasks = this.taskStore.tasks;
  protected readonly loading = this.taskStore.loading;
  protected readonly mutating = this.taskStore.mutating;
  protected readonly totalElements = this.taskStore.totalElements;
  protected readonly totalPages = this.taskStore.totalPages;
  protected readonly currentPage = this.taskStore.page;
  protected readonly pendingTasksCount = this.taskStore.pendingTasksCount;
  protected readonly overdueTasksCount = this.taskStore.overdueTasksCount;
  protected readonly completedTasksCount = this.taskStore.completedTasksCount;
  protected readonly error = this.taskStore.error;
  protected readonly activeFiltersCount = computed(() => {
    let total = 0;
    if (this.searchTerm().trim().length > 0) {
      total += 1;
    }
    if (this.statusFilter() !== 'ALL') {
      total += 1;
    }
    if (this.pendingOnlyFilter()) {
      total += 1;
    }
    if (this.overdueFilter()) {
      total += 1;
    }
    return total;
  });
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index)
  );
  protected readonly hasPreviousPage = computed(() => this.currentPage() > 0);
  protected readonly hasNextPage = computed(() => this.currentPage() + 1 < this.totalPages());
  protected readonly hasTasks = computed(() => this.tasks().length > 0);
  protected readonly deleteConfirmMessage = computed(() => {
    const task = this.taskPendingDelete();
    return task ? `¿Deseas eliminar la tarea "${task.title}"?` : '';
  });

  protected readonly statusOptions: ReadonlyArray<{ label: string; value: StatusFilterValue }> = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Programado', value: 'PROGRAMADO' },
    { label: 'En ejecución', value: 'EN_EJECUCION' },
    { label: 'Finalizada', value: 'FINALIZADA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  private readonly searchEffect = effect((onCleanup) => {
    const value = this.searchTerm();
    const timeoutId = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed === this.taskStore.filters().search) {
        return;
      }

      this.taskStore.setFilters({ search: trimmed });
      void this.reloadFromFirstPage();
    }, this.searchDebounceMs);

    onCleanup(() => clearTimeout(timeoutId));
  });

  constructor() {
    void this.initialize();
  }

  protected trackByTaskId(index: number, task: Task): number {
    return task.id ?? index;
  }

  protected trackBySubtaskId(index: number, subtask: { id: number }): number {
    return subtask.id ?? index;
  }

  protected async onStatusFilterChange(value: string): Promise<void> {
    this.statusFilter.set(value as StatusFilterValue);
    this.taskStore.setFilters({ status: this.statusFilter() });
    await this.reloadFromFirstPage();
  }

  protected async onPendingOnlyChange(checked: boolean): Promise<void> {
    this.pendingOnlyFilter.set(checked);
    if (checked) {
      this.overdueFilter.set(false);
    }
    await this.reloadFromFirstPage();
  }

  protected async onOverdueChange(checked: boolean): Promise<void> {
    this.overdueFilter.set(checked);
    if (checked) {
      this.pendingOnlyFilter.set(false);
    }
    await this.reloadFromFirstPage();
  }

  protected async clearFilters(): Promise<void> {
    this.searchTerm.set('');
    this.statusFilter.set('ALL');
    this.pendingOnlyFilter.set(false);
    this.overdueFilter.set(false);
    this.taskStore.setFilters({ search: '', status: 'ALL' });
    await this.reloadFromFirstPage();
  }

  protected async refresh(): Promise<void> {
    await this.reloadCurrentPage();
  }

  protected async goToPage(page: number): Promise<void> {
    const normalizedPage = Math.max(0, Math.min(page, Math.max(this.totalPages() - 1, 0)));
    this.taskStore.setPage(normalizedPage);
    await this.reloadCurrentPage();
  }

  protected openDeleteConfirm(task: Task): void {
    this.taskPendingDelete.set(task);
    this.deleteConfirmOpen.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.deleteConfirmOpen.set(false);
    this.taskPendingDelete.set(null);
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const task = this.taskPendingDelete();
    this.closeDeleteConfirm();
    if (!task) {
      return;
    }

    await this.taskStore.deleteTask(task.id);
    await this.reloadCurrentPage();
  }

  protected async changeTaskStatus(task: Task): Promise<void> {
    const payload: UpdateTaskRequestDto = {
      title: task.title,
      description: task.description,
      executionDate: task.executionDate,
      status: this.getNextStatus(task.status),
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        description: subtask.description,
        completed: subtask.completed
      }))
    };

    await this.taskStore.updateTask(task.id, payload);
    await this.reloadCurrentPage();
  }

  protected openDetail(task: Task): void {
    this.detailTaskId.set(task.id);
    this.detailOpen.set(true);
  }

  protected openCreateForm(): void {
    this.editingTaskId.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(task: Task): void {
    this.editingTaskId.set(task.id);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingTaskId.set(null);
  }

  protected async onFormSaved(): Promise<void> {
    this.closeForm();
    await this.reloadCurrentPage();
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.detailTaskId.set(null);
  }

  protected openEditFromDetail(taskId: number): void {
    this.closeDetail();
    this.editingTaskId.set(taskId);
    this.formOpen.set(true);
  }

  protected async onDetailDeleted(): Promise<void> {
    this.closeDetail();
    await this.reloadCurrentPage();
  }

  protected statusClass(status: TaskStatus): string {
    switch (status) {
      case 'PROGRAMADO':
        return 'badge-info';
      case 'EN_EJECUCION':
        return 'badge-warning';
      case 'FINALIZADA':
        return 'badge-success';
      case 'CANCELADA':
        return 'badge-neutral';
      default:
        return 'badge-ghost';
    }
  }

  protected isOverdue(task: Task): boolean {
    if (task.status !== 'PROGRAMADO') {
      return false;
    }
    return new Date(task.executionDate).getTime() < Date.now();
  }

  private async initialize(): Promise<void> {
    await Promise.all([this.reloadCurrentPage(), this.taskStore.findPending(10), this.taskStore.findOverdue(10)]);
  }

  private async reloadFromFirstPage(): Promise<void> {
    this.taskStore.setPage(0);
    await this.reloadCurrentPage();
  }

  private async reloadCurrentPage(): Promise<void> {
    await this.taskStore.loadTasks({
      page: this.taskStore.page(),
      overdue: this.overdueFilter(),
      pendingOnly: this.pendingOnlyFilter()
    });
    await Promise.all([this.taskStore.findPending(10), this.taskStore.findOverdue(10)]);
  }

  private getNextStatus(status: TaskStatus): TaskStatus {
    switch (status) {
      case 'PROGRAMADO':
        return 'EN_EJECUCION';
      case 'EN_EJECUCION':
        return 'FINALIZADA';
      case 'FINALIZADA':
        return 'CANCELADA';
      case 'CANCELADA':
        return 'PROGRAMADO';
      default:
        return 'PROGRAMADO';
    }
  }
}
