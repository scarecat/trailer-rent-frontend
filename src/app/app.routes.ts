import { Routes } from '@angular/router';
import { loggedInGuard } from './guards/logged-in-guard';
import { HomePage } from './pages/home.page/home.page';
import { LoginPage } from './pages/login.page/login.page';
import { RegisterPage } from './pages/register.page/register.page';
import { TrailerPage } from './pages/trailer.page/trailer.page';
import { adminGuard } from './guards/admin-guard';
import { AdminPage } from './pages/admin.page/admin.page';
import { RentalFormPage } from './pages/rental-form.page/rental-form.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [loggedInGuard],
    component: HomePage,
  },
  {
    path: 'login',
    canActivate: [],
    component: LoginPage,
  },
  {
    path: 'register',
    canActivate: [],
    component: RegisterPage,
  },
  {
    path: 'trailers',
    canActivate: [loggedInGuard],
    component: TrailerPage,
  },
  {
    path: 'rental-form',
    canActivate: [loggedInGuard],
    component: RentalFormPage,
  },
  {
    path: 'admin',
    canActivateChild: [loggedInGuard, adminGuard],
    component: AdminPage,
  },
];
