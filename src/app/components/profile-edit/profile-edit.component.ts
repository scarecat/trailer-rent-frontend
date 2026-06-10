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
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
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
