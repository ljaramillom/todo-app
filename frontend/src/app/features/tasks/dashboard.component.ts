import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskStore } from '@core/state/task.store';
import { Task, TaskStatus } from '@shared/models/task.model';
import { TaskFormComponent } from './task-form.component';
import { TaskDetailComponent } from './task-detail.component';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink, TaskFormComponent, TaskDetailComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly taskStore = inject(TaskStore);

  protected readonly loading = this.taskStore.loading;
  protected readonly mutating = this.taskStore.mutating;
  protected readonly pendingTasks = this.taskStore.pendingTasks;
  protected readonly overdueTasks = this.taskStore.overdueTasks;
  protected readonly pendingTasksCount = this.taskStore.pendingTasksCount;
  protected readonly overdueTasksCount = this.taskStore.overdueTasksCount;
  protected readonly totalTasksCount = this.taskStore.totalElements;
  protected readonly error = this.taskStore.error;

  protected readonly formOpen = signal(false);
  protected readonly formTaskId = signal<number | null>(null);
  protected readonly detailOpen = signal(false);
  protected readonly detailTaskId = signal<number | null>(null);

  protected readonly hasOverdue = computed(() => this.overdueTasksCount() > 0);
  protected readonly pendingPreview = computed(() => this.pendingTasks().slice(0, 6));
  protected readonly overduePreview = computed(() => this.overdueTasks().slice(0, 6));

  constructor() {
    void this.loadDashboardData();
  }

  protected trackByTaskId(index: number, task: Task): number {
    return task.id ?? index;
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

  protected statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'PROGRAMADO':
        return 'Programado';
      case 'EN_EJECUCION':
        return 'En ejecucion';
      case 'FINALIZADA':
        return 'Finalizada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }

  protected openCreateTask(): void {
    this.formTaskId.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.formTaskId.set(null);
  }

  protected openDetail(taskId: number): void {
    this.detailTaskId.set(taskId);
    this.detailOpen.set(true);
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
    this.detailTaskId.set(null);
  }

  protected async onFormSaved(): Promise<void> {
    this.closeForm();
    await this.loadDashboardData();
  }

  protected async onDetailDeleted(): Promise<void> {
    this.closeDetail();
    await this.loadDashboardData();
  }

  protected openEditFromDetail(taskId: number): void {
    this.closeDetail();
    this.formTaskId.set(taskId);
    this.formOpen.set(true);
  }

  protected async refresh(): Promise<void> {
    await this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    await Promise.all([
      this.taskStore.loadTasks({ page: 0, size: 1 }),
      this.taskStore.findPending(10),
      this.taskStore.findOverdue(10)
    ]);
  }
}
