import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-add-employee',
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
    <mat-card-title>Dodaj pracownika</mat-card-title>
  </mat-card-header>

  <mat-card-content>
    <form [formGroup]="form" (ngSubmit)="submit()">

      <div class="row-two">
        <mat-form-field appearance="outline">
          <mat-label>Imię</mat-label>
          <input matInput formControlName="firstName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nazwisko</mat-label>
          <input matInput formControlName="lastName" />
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Numer telefonu</mat-label>
        <input matInput formControlName="phoneNumber" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Wynagrodzenie</mat-label>
        <input matInput type="number" formControlName="salary" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Hasło</mat-label>
        <input matInput type="password" formControlName="password" />
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
        Dodaj pracownika
      </button>

    </form>
  </mat-card-content>
</mat-card>
`,
  styles: []
})
export class AddEmployeePage {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  loading = signal(false);

  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    salary: [0, [Validators.required, Validators.min(0)]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.usersService.addEmployee(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);

        this.snack.open('Pracownik dodany', 'OK', { duration: 4000 });

        this.router.navigate(['/admin/employees']);
      },
      error: (err) => {
        this.loading.set(false);

        this.snack.open(err.error?.message ?? 'Błąd dodawania pracownika', 'OK', {
          duration: 4000,
        });
      },
    });
  }
}
