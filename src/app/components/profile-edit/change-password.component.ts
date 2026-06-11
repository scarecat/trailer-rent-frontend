import { Component, inject, signal } from '@angular/core';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
<mat-card class="auth-card">
  <mat-card-title>Zmiana hasła</mat-card-title>

  <form [formGroup]="form" (ngSubmit)="submit()">

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Aktualne hasło</mat-label>
      <input matInput type="password" formControlName="currentPassword" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Nowe hasło</mat-label>
      <input matInput type="password" formControlName="newPassword" />
    </mat-form-field>

    <button mat-raised-button color="primary" class="full-width" [disabled]="loading()">
      Zmień hasło
    </button>
  </form>
</mat-card>
  `,

  styles: `
mat-card {margin: auto; margin-top: 64px; padding: 1em }
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
export class ChangePasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  loading = signal(false);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Hasło zmienione', 'OK', { duration: 3000 });
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message || 'Błąd zmiany hasła', 'OK', { duration: 4000 });
      },
    });
  }
}
