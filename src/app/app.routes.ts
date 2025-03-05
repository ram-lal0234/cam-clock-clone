import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from './shared/services/supabase.service';
import { map } from 'rxjs/operators';
import { User } from './shared/models/user.model';
import { toObservable } from '@angular/core/rxjs-interop';

const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  return toObservable(supabase.authState$).pipe(
    map((user: User | null) => {
      if (!user) {
        return false;
      }
      return true;
    })
  );
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'timer',
    loadChildren: () => import('./timer/timer.routes').then(m => m.TIMER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'projects',
    loadChildren: () => import('./projects/projects.routes').then(m => m.PROJECTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'team',
    loadChildren: () => import('./team/team.routes').then(m => m.TEAM_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];