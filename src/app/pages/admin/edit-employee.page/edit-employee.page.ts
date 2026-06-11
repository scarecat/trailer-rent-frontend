import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  template: `
<mat-card class="auth-card" style="margin: auto">
  <mat-card-header>
    <mat-card-title>Edytuj pracownika</mat-card-title>
  </mat-card-header>

  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="row-two">
        <mat-form-field appearance="outline">
          <mat-label>Imię</mat-label>
          <input matInput formControlName="firstName" />
          @if (form.get('firstName')?.hasError('required')) {
            <mat-error>Wymagane</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nazwisko</mat-label>
          <input matInput formControlName="lastName" />
          @if (form.get('lastName')?.hasError('required')) {
            <mat-error>Wymagane</mat-error>
          }
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
        @if (form.get('email')?.hasError('required')) {
          <mat-error>Wymagane</mat-error>
        }
        @if (form.get('email')?.hasError('email')) {
          <mat-error>Niepoprawny email</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Numer telefonu</mat-label>
        <input matInput formControlName="phoneNumber" />
        @if (form.get('phoneNumber')?.hasError('required')) {
          <mat-error>Wymagane</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Wynagrodzenie</mat-label>
        <input matInput type="number" formControlName="salary" />
        @if (form.get('salary')?.hasError('required')) {
          <mat-error>Wymagane</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nowe hasło (opcjonalnie)</mat-label>
        <input matInput type="password" formControlName="password" />
        <mat-hint>Zostaw puste, jeśli nie zmieniasz hasła</mat-hint>
      </mat-form-field>

      <button
        mat-raised-button
        color="primary"
        type="submit"
        class="full-width"
        [disabled]="loading()"
      >
        @if (loading()) {
          <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px"></mat-spinner>
        }
        Zapisz zmiany
      </button>
    </form>
  </mat-card-content>

  <mat-card-actions>
    <button
      (click)="onRemoveProfileClick()"
      mat-raised-button
      color="warn"
      type="button"
      class="full-width"
    >
      Usuń pracownika
    </button>
  </mat-card-actions>
</mat-card>
`,
  styles: `
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 480px;
}

.full-width {
  width: 100%;
  margin-bottom: 12px;
  display: block;
}

.row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  mat-form-field {
    width: 100%;
  }
}

.center-text {
  text-align: center;
  width: 100%;
  margin: 8px 0 0;
}

mat-card-header {
  margin-bottom: 16px;
}
  `
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

    this.usersService.updateEmployee(this.employeeId, this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);

        this.snack.open('Dane pracownika zostały zapisane', 'OK', { duration: 4000 });

        this.router.navigate(['/admin/employees']);
      },
      error: (err) => {
        this.loading.set(false);

        this.snack.open(err.error?.message ?? 'Nie udało się zapisać zmian', 'OK', {
          duration: 4000,
        });
      },
    });
  }

  onRemoveProfileClick(): void {
    const confirmed = confirm(
      'Czy na pewno chcesz usunąć tego pracownika? Tej operacji nie można cofnąć.',
    );

    if (!confirmed) {
      return;
    }

    this.loading.set(true);

    this.usersService.deleteEmployee(this.employeeId).subscribe({
      next: () => {
        this.loading.set(false);

        this.snack.open('Pracownik został usunięty', 'OK', { duration: 4000 });

        this.router.navigate(['/admin/employees']);
      },
      error: (err) => {
        this.loading.set(false);

        this.snack.open(err.error?.message ?? 'Nie udało się usunąć pracownika', 'OK', {
          duration: 4000,
        });
      },
    });
  }
}
