import { Task, TaskStatus } from '@shared/models/task.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TaskListQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: TaskStatus;
  overdue?: boolean;
  pendingOnly?: boolean;
}

export interface SubtaskCreateRequestDto {
  description: string;
  completed?: boolean;
}

export interface SubtaskUpsertRequestDto {
  id?: number;
  description: string;
  completed?: boolean;
}

export interface CreateTaskRequestDto {
  title: string;
  description: string | null;
  executionDate: string;
  status?: TaskStatus;
  subtasks: SubtaskCreateRequestDto[];
}

export interface UpdateTaskRequestDto {
  title: string;
  description: string | null;
  executionDate: string;
  status: TaskStatus;
  subtasks: SubtaskUpsertRequestDto[];
}

export interface PatchTaskStatusRequestDto {
  status: TaskStatus;
}

export type TaskResponseDto = Task;
