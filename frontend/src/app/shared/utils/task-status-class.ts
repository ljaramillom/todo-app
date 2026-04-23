import { TaskStatus } from '@shared/models/task.model';

export function taskStatusClass(status: TaskStatus): string {
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
