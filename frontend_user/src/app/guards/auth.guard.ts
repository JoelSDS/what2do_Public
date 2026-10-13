import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);

  const token = await authStorageService.getToken();
  if (token) {
    return true;
  }

  router.navigate(['/tabs/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
