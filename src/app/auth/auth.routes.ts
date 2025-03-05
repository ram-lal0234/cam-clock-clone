import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent) },
      { path: 'forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'workspace-select', loadComponent: () => import('./workspace-select/workspace-select.component').then(m => m.WorkspaceSelectComponent) },
      { path: 'create-workspace', loadComponent: () => import('./create-workspace/create-workspace.component').then(m => m.CreateWorkspaceComponent) }
    ]
  }
];