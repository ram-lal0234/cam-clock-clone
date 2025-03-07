import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be initialized
  if (!authService.isInitialized()) {
    return false;
  }

  const user = authService.user$();

  if (user) {
    if (state.url.startsWith('/auth')) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  if (!state.url.startsWith('/auth')) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user$();

  if (!user) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};