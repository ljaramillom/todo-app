import { TaskStatus } from '@shared/models/task.model';

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'PROGRAMADO':
      return 'Programado';
    case 'EN_EJECUCION':
      return 'En ejecución';
    case 'FINALIZADA':
      return 'Finalizada';
    case 'CANCELADA':
      return 'Cancelada';
    default:
      return status;
  }
}
