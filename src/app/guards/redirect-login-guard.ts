import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const redirectLoginGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.parseUrl(auth.user()?.role == "Administrator" ? "/admin/trailers" : "/trailers");
};
