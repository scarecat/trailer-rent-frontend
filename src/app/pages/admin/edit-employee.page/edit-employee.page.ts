import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-employee.page.html',
  styleUrls: ['./edit-employee.page.scss'],
})
export class EditEmployeePage {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = signal(false);

  employeeId!: number;

  form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    salary: [0, [Validators.required, Validators.min(0)]],
    password: [''],
  });

  constructor() {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    this.usersService
    .getById(this.employeeId)
    .pipe(takeUntilDestroyed())
    .subscribe((employee) => {
      this.form.patchValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        salary: employee.salary,
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.usersService
    .updateEmployee(this.employeeId, this.form.getRawValue())
    .subscribe({
      next: () => {
        this.loading.set(false);

        this.snack.open(
          'Dane pracownika zostały zapisane',
          'OK',
          { duration: 4000 }
        );

        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.loading.set(false);

        this.snack.open(
          err.error?.message ?? 'Nie udało się zapisać zmian',
          'OK',
          { duration: 4000 }
        );
      },
    });
  }

  onRemoveProfileClick(): void {
    const confirmed = confirm(
      'Czy na pewno chcesz usunąć tego pracownika? Tej operacji nie można cofnąć.'
    );

    if (!confirmed) {
      return;
    }

    this.loading.set(true);

    this.usersService
    .deleteEmployee(this.employeeId)
    .subscribe({
      next: () => {
        this.loading.set(false);

        this.snack.open(
          'Pracownik został usunięty',
          'OK',
          { duration: 4000 }
        );

        this.router.navigate(['/admin/employees']);
      },
      error: (err) => {
        this.loading.set(false);

        this.snack.open(
          err.error?.message ?? 'Nie udało się usunąć pracownika',
          'OK',
          { duration: 4000 }
        );
      },
    });
  }


}
