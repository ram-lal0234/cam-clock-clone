import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';

export const PROJECTS_ROUTES: Routes = [
  { path: '', component: ProjectsComponent },
  { path: ':id', component: ProjectDetailComponent }
];