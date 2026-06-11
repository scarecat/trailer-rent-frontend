import { Routes } from '@angular/router';
import { loggedInGuard } from './guards/logged-in-guard';
import { HomePage } from './pages/home.page/home.page';
import { LoginPage } from './pages/login.page/login.page';
import { RegisterPage } from './pages/register.page/register.page';
import { TrailerPage } from './pages/trailer.page/trailer.page';
import { adminGuard } from './guards/admin-guard';
import { RentalFormPage } from './pages/rental-form.page/rental-form.page';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MyRentalsPage } from './pages/my-rentals.page/my-rentals.page';
import { AdminRentalsPage } from './pages/admin-rentals.page/admin-rentals.page';
import { ProfilePage } from './pages/profile.page/profile.page';
import { AdminClientsPage } from './pages/admin-clients.page/admin-clients.page';
import { AdminEmployeesPage } from './pages/admin-employees.page/admin-employees.page';
import { AdminAddTrailerPage } from './pages/admin-add-trailer.page/admin-add-trailer.page';
import { AdminTrailersPage } from './pages/admin-trailers.page/admin-trailers.page';
import { AdminEditTrailerPage } from './pages/admin-add-trailer.page/admin-edit-trailer.page';
import { AdminAddEmployeePage } from './pages/admin-add-employee.page/admin-add-employee.page';
import { EditEmployeePage } from './pages/admin/edit-employee.page/edit-employee.page';

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
    path: 'logout',
    redirectTo: () => {
      const auth = inject(AuthService);
      auth.logout();
      return '/login';
    },
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
    path: 'profile',
    canActivate: [loggedInGuard],
    component: ProfilePage,
  },
  {
    path: 'rentals',
    canActivateChild: [loggedInGuard],
    children: [
      {
        path: 'new',
        component: RentalFormPage,
      },
      {
        path: 'my',
        component: MyRentalsPage,
      },
    ],
  },
  {
    path: 'admin',
    canActivateChild: [loggedInGuard, adminGuard],
    children: [
      {
        path: 'rentals',
        component: AdminRentalsPage,
      },
      {
        path: 'clients',
        component: AdminClientsPage,
      },
      {
        path: 'employees',
        component: AdminEmployeesPage,
      },
      {
        path: 'employees/add',
        component: AdminAddEmployeePage,
      },
      {
        path: 'employees/:id/edit',
        component: EditEmployeePage,
      },
      {
        path: 'trailers',
        pathMatch: 'full',
        component: AdminTrailersPage,
      },
      {
        path: 'trailers/add',
        pathMatch: 'full',
        component: AdminAddTrailerPage,
      },
      {
        path: 'trailers/:id/edit',
        pathMatch: 'full',
        component: AdminEditTrailerPage,
      },
    ],
  },
];
