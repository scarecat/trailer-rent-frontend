import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RentalsService } from '../../services/rentals.service';
import { TrailersService } from '../../services/trailers.service';
import { Trailer } from '../../models/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './rental-form.page.html',
  styleUrls: ['./rental-form.page.scss'],
})
export class RentalFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private rentalsSvc = inject(RentalsService);
  private trailersSvc = inject(TrailersService);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  public trailer = signal<Trailer | null>(null);
  public loading = signal<boolean>(false);
  public submitting = signal<boolean>(false);
  public readonly minDate = new Date();

  public form: FormGroup<{
    startDate: FormControl<Date | null>;
    endDate: FormControl<Date | null>;
  }>;

  public estimatedDays = computed(() => {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    if (!startDate || !endDate) return 0;

    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  public estimatedCost = computed(() => {
    const currentTrailer = this.trailer();
    if (!currentTrailer) return 0;
    return this.estimatedDays() * currentTrailer.pricePerDay;
  });

  constructor() {
    this.form = this.fb.group({
      startDate: [null as Date | null, Validators.required],
      endDate: [null as Date | null, Validators.required],
    });

    this.setupDateValidators();
  }

  ngOnInit(): void {
    this.loadTrailer();
  }

  private setupDateValidators(): void {
    this.form
      .get('startDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.validateDates();
      });

    this.form
      .get('endDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.validateDates();
      });
  }

  private validateDates(): void {
    const startDate = this.form.get('startDate')?.value;
    const endDate = this.form.get('endDate')?.value;

    if (startDate && endDate && endDate < startDate) {
      this.form.get('endDate')?.setErrors({ endDateBeforeStart: true });
    } else if (endDate && startDate && endDate >= startDate) {
      const currentErrors = this.form.get('endDate')?.errors;
      if (currentErrors) {
        const { endDateBeforeStart, ...rest } = currentErrors;
        this.form.get('endDate')?.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
  }

  private loadTrailer(): void {
    const trailerId = this.route.snapshot.queryParamMap.get('trailerId');

    if (!trailerId) {
      this.snack.open('Nie wybrano przyczepy', 'OK', { duration: 3000 });
      this.router.navigate(['/trailers']);
      return;
    }

    this.loading.set(true);

    this.trailersSvc
      .getById(+trailerId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (trailer) => {
          this.trailer.set(trailer);
        },
        error: (error) => {
          console.error('Błąd podczas ładowania przyczepy:', error);
          this.snack.open('Nie udało się załadować danych przyczepy', 'OK', { duration: 5000 });
          this.router.navigate(['/trailers']);
        },
      });
  }

  public submit(): void {
    if (this.form.invalid) {
      const startDate = this.form.get('startDate');
      const endDate = this.form.get('endDate');

      if (startDate?.hasError('required')) {
        this.snack.open('Wybierz datę rozpoczęcia', 'OK', { duration: 3000 });
      } else if (endDate?.hasError('required')) {
        this.snack.open('Wybierz datę zakończenia', 'OK', { duration: 3000 });
      } else if (endDate?.hasError('endDateBeforeStart')) {
        this.snack.open('Data zakończenia nie może być wcześniejsza niż data rozpoczęcia', 'OK', {
          duration: 5000,
        });
      }
      return;
    }

    const currentTrailer = this.trailer();
    if (!currentTrailer) return;

    this.submitting.set(true);

    const { startDate, endDate } = this.form.value;

    this.rentalsSvc
      .create({
        trailerId: currentTrailer.id,
        startDate: new Date(startDate!).toISOString(),
        endDate: new Date(endDate!).toISOString(),
      })
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.snack.open('Rezerwacja złożona pomyślnie', 'OK', { duration: 4000 });
          this.router.navigate(['/rentals/my']);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Błąd podczas składania rezerwacji';
          this.snack.open(errorMessage, 'OK', { duration: 5000 });
          console.error('Błąd rezerwacji:', err);
        },
      });
  }

  public hasError(controlName: string, errorCode: string): boolean {
    const control = this.form.get(controlName);
    return (control?.hasError(errorCode) && control?.touched === true) ?? false;
  }
}
