import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./projects-list/projects-list.component').then(m => m.ProjectsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./project-create/project-create.component').then(m => m.ProjectCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./project-details/project-details.component').then(m => m.ProjectDetailsComponent)
  }
];