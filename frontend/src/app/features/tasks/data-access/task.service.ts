import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subtask, Task } from '@shared/models/task.model';
import {
  CreateTaskRequestDto,
  PageResponse,
  PatchTaskStatusRequestDto,
  TaskListQueryParams,
  UpdateTaskRequestDto
} from './task.dto';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  listTasks(query: TaskListQueryParams): Observable<PageResponse<Task>> {
    return this.http.get<PageResponse<Task>>('/api/tasks', {
      params: this.buildTaskQueryParams(query)
    });
  }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`/api/tasks/${taskId}`);
  }

  createTask(payload: CreateTaskRequestDto): Observable<Task> {
    return this.http.post<Task>('/api/tasks', payload);
  }

  updateTask(taskId: number, payload: UpdateTaskRequestDto): Observable<Task> {
    return this.http.put<Task>(`/api/tasks/${taskId}`, payload);
  }

  updateTaskStatus(taskId: number, payload: PatchTaskStatusRequestDto): Observable<Task> {
    return this.http.patch<Task>(`/api/tasks/${taskId}/status`, payload);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${taskId}`);
  }

  toggleSubtask(subtaskId: number): Observable<Subtask> {
    return this.http.patch<Subtask>(`/api/subtasks/${subtaskId}/toggle`, {});
  }

  findPending(query: Omit<TaskListQueryParams, 'pendingOnly' | 'overdue'> = {}): Observable<PageResponse<Task>> {
    return this.listTasks({
      ...query,
      pendingOnly: true
    });
  }

  findOverdue(query: Omit<TaskListQueryParams, 'pendingOnly' | 'overdue'> = {}): Observable<PageResponse<Task>> {
    return this.listTasks({
      ...query,
      overdue: true
    });
  }

  private buildTaskQueryParams(query: TaskListQueryParams): HttpParams {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }
    if (query.search && query.search.trim().length > 0) {
      params = params.set('search', query.search.trim());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.overdue !== undefined) {
      params = params.set('overdue', query.overdue);
    }
    if (query.pendingOnly !== undefined) {
      params = params.set('pendingOnly', query.pendingOnly);
    }

    return params;
  }
}
