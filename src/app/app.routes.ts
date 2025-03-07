import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './auth/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'projects',
        loadChildren: () => import('./projects/projects.routes').then(m => m.PROJECTS_ROUTES)
      },
      // {
      //   path: 'tasks',
      //   loadChildren: () => import('./tasks/tasks.routes').then(m => m.TASKS_ROUTES)
      // },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./settings/settings.routes').then(m => m.SETTINGS_ROUTES)
      // }
    ]
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  }
];