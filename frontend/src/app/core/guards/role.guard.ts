import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (expectedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getUser();

    if (user && expectedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};
