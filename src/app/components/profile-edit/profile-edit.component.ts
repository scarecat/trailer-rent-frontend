import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ChangePasswordComponent } from "./change-password.component";

@Component({
  selector: 'app-edit-profile',
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
    ChangePasswordComponent
],
  template: `
<mat-card class="auth-card" style="margin: auto">
  <mat-card-header>
    <mat-card-title>Edytuj profil</mat-card-title>
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
          <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px"></mat-spinner>
        }
        Edytuj profil
      </button>
    </form>
  </mat-card-content>
  <mat-card-actions>
    <button
      (click)="onRemoveProfileClick()"
      mat-raised-button
      style="color: red"
      type="button"
      class="full-width"
    >
      Usuń profil
    </button>
  </mat-card-actions>
</mat-card>
<app-change-password></app-change-password>
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
export class ProfileEditComponent {
  form: FormGroup;
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    });

    this.auth
      .getInfo()
      .pipe(takeUntilDestroyed())
      .subscribe((info) => {
        this.form.patchValue(info);
      });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.edit(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Zaktualizowano pomyślnie!', 'OK', { duration: 4000 });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message || 'Błąd edycji profilu', 'OK', { duration: 4000 });
      },
    });
  }

  onRemoveProfileClick() {
    this.auth.delete().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.snack.open('Usunięto konto', 'OK', { duration: 4000 });
      },
    });
  }
}
