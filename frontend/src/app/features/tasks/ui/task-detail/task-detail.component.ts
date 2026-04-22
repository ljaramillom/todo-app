import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskStore } from '@core/state/task.store';
import { Task, TaskStatus } from '@shared/models/task.model';
import { taskStatusLabel } from '@shared/utils/task-status-label';
import { UpdateTaskRequestDto } from '../../data-access/task.dto';

@Component({
  selector: 'app-task-detail',
  imports: [DatePipe],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent {
  private readonly taskStore = inject(TaskStore);

  protected readonly statusLabel = taskStatusLabel;

  readonly open = input<boolean>(false);
  readonly taskId = input<number | null>(null);
  readonly closed = output<void>();
  readonly editRequested = output<number>();
  readonly deleted = output<void>();

  protected readonly task = signal<Task | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mutating = this.taskStore.mutating;

  protected readonly totalSubtasks = computed(() => this.task()?.subtasks.length ?? 0);
  protected readonly completedSubtasks = computed(
    () => this.task()?.subtasks.filter((subtask) => subtask.completed).length ?? 0
  );
  protected readonly completionPercentage = computed(() => {
    const total = this.totalSubtasks();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.completedSubtasks() / total) * 100);
  });
  protected readonly isOverdue = computed(() => {
    const currentTask = this.task();
    if (!currentTask || currentTask.status !== 'PROGRAMADO') {
      return false;
    }
    return new Date(currentTask.executionDate).getTime() < Date.now();
  });

  private readonly loadTaskEffect = effect(() => {
    if (!this.open()) {
      return;
    }

    const currentTaskId = this.taskId();
    if (currentTaskId === null) {
      this.task.set(null);
      return;
    }

    void this.loadTask(currentTaskId);
  });

  protected close(): void {
    this.closed.emit();
  }

  protected trackBySubtaskId(index: number, subtask: { id: number }): number {
    return subtask.id ?? index;
  }

  protected async toggleSubtask(subtaskId: number): Promise<void> {
    const success = await this.taskStore.toggleSubtask(subtaskId);
    if (!success) {
      this.error.set('No se pudo actualizar la subtarea.');
      return;
    }

    const currentTaskId = this.taskId();
    if (currentTaskId !== null) {
      await this.loadTask(currentTaskId);
    }
  }

  protected requestEdit(): void {
    const currentTaskId = this.taskId();
    if (currentTaskId !== null) {
      this.editRequested.emit(currentTaskId);
    }
  }

  protected async deleteTask(): Promise<void> {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }

    const confirmed = window.confirm(`Deseas eliminar la tarea "${currentTask.title}"?`);
    if (!confirmed) {
      return;
    }

    const success = await this.taskStore.deleteTask(currentTask.id);
    if (!success) {
      this.error.set('No se pudo eliminar la tarea.');
      return;
    }

    this.deleted.emit();
    this.closed.emit();
  }

  protected async changeTaskStatus(): Promise<void> {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }

    const payload: UpdateTaskRequestDto = {
      title: currentTask.title,
      description: currentTask.description,
      executionDate: currentTask.executionDate,
      status: this.getNextStatus(currentTask.status),
      subtasks: currentTask.subtasks.map((subtask) => ({
        id: subtask.id,
        description: subtask.description,
        completed: subtask.completed
      }))
    };

    const updated = await this.taskStore.updateTask(currentTask.id, payload);
    if (!updated) {
      this.error.set('No se pudo cambiar el estado de la tarea.');
      return;
    }

    await this.loadTask(currentTask.id);
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

  private async loadTask(taskId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const taskFromList = this.taskStore.tasks().find((task) => task.id === taskId) ?? null;
    if (taskFromList) {
      this.task.set(taskFromList);
    }

    const taskFromApi = await this.taskStore.loadTaskById(taskId);
    if (!taskFromApi) {
      this.error.set('No se pudo cargar el detalle de la tarea.');
    } else {
      this.task.set(taskFromApi);
    }

    this.loading.set(false);
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
