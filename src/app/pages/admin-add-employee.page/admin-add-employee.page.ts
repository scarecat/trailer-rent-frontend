import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-admin-add-employee.page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./admin-add-employee.page.scss'],
  template: `
    <div class="auth-wrapper">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Rejestracja pracownika</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="row-two">
              <mat-form-field appearance="outline">
                <mat-label>Imie</mat-label>
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
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
              @if (form.get('email')?.hasError('required')) {
                <mat-error>Wymagane</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Nieprawidlowy e-mail</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Haslo</mat-label>
              <input
                matInput
                type="password"
                formControlName="password"
                autocomplete="new-password"
              />
              @if (form.get('password')?.hasError('required')) {
                <mat-error>Wymagane</mat-error>
              }
              @if (form.get('password')?.hasError('minlength')) {
                <mat-error>Minimum 6 znakow</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Numer telefonu</mat-label>
              <input matInput formControlName="phoneNumber" />
              @if (form.get('phoneNumber')?.hasError('required')) {
                <mat-error>Wymagane</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner
                  diameter="20"
                  style="display: inline-block; margin-right: 8px"
                ></mat-spinner>
              }
              Zarejestruj pracownika
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class AdminAddEmployeePage {
  form: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.usersService.addEmployee(this.form.value).subscribe({
      next: () => this.router.navigate(['/admin/employees']),
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message || 'Błąd rejestracji', 'OK', { duration: 4000 });
      },
    });
  }
}
