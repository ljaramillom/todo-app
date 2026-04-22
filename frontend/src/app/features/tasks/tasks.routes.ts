import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/tasks-shell.page').then((m) => m.TasksShellPage)
  }
];
