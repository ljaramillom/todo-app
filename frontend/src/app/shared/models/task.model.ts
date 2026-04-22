export type TaskStatus = 'PROGRAMADO' | 'EN_EJECUCION' | 'FINALIZADA' | 'CANCELADA';

export interface Subtask {
  id: number;
  description: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  executionDate: string;
  status: TaskStatus;
  subtasks: Subtask[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'ALL';
}
