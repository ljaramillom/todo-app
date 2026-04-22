import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/layouts/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
        data: { preload: true }
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/not-found.page').then((m) => m.NotFoundPage)
      }
    ]
  }
];
