import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RentalsService } from '../../services/rentals.service';
import { AuthService } from '../../services/auth.service';
import { Rental } from '../../models/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

type RentalStatus =
  | 'Oczekujaca'
  | 'Zatwierdzona'
  | 'Odrzucona'
  | 'Aktywna'
  | 'Zakonczona'
  | 'Anulowana';

@Component({
  selector: 'app-my-rentals',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './my-rentals.page.html',
  styleUrls: ['./my-rentals.page.scss'],
})
export class MyRentalsPage {
  // Dependency injection
  private rentalsSvc = inject(RentalsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  // State signals
  public rentals = signal<Rental[]>([]);
  public filteredRentals = signal<Rental[]>([]);
  public loading = signal<boolean>(false);
  public selectedStatus = signal<RentalStatus | 'ALL'>('ALL');

  // Current date as signal
  public currentDate = signal(new Date());

  // Status configuration for select
  public readonly statusOptions: { value: 'ALL' | RentalStatus; label: string; icon: string }[] = [
    { value: 'ALL', label: 'Wszystkie statusy', icon: 'list' },
    { value: 'Oczekujaca', label: 'Oczekująca', icon: 'hourglass_empty' },
    { value: 'Zatwierdzona', label: 'Zatwierdzona', icon: 'check_circle' },
    { value: 'Aktywna', label: 'Aktywna', icon: 'play_circle' },
    { value: 'Zakonczona', label: 'Zakończona', icon: 'done_all' },
    { value: 'Anulowana', label: 'Anulowana', icon: 'cancel' },
    { value: 'Odrzucona', label: 'Odrzucona', icon: 'block' },
  ];

  // Computed values
  public hasRentals = computed(() => this.filteredRentals().length > 0);

  public activeCount = computed(
    () =>
      this.rentals().filter((r) => r.status === 'Aktywna' || r.status === 'Zatwierdzona').length,
  );

  public pendingCount = computed(
    () => this.rentals().filter((r) => r.status === 'Oczekujaca').length,
  );

  constructor() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.loadMyRentals();
    }
  }

  private loadMyRentals(): void {
    this.loading.set(true);

    this.rentalsSvc
      .getMy()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rentals) => {
          this.rentals.set(rentals);
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error loading rentals:', error);
          this.snack.open('Nie udało się załadować wypożyczeń', 'OK', { duration: 5000 });
        },
      });
  }

  public applyFilter(): void {
    const status = this.selectedStatus();
    if (status === 'ALL') {
      this.filteredRentals.set(this.rentals());
    } else {
      this.filteredRentals.set(this.rentals().filter((r) => r.status === status));
    }
  }

  public onStatusChange(status: 'ALL' | RentalStatus): void {
    this.selectedStatus.set(status);
    this.applyFilter();
  }

  public cancelRental(rental: Rental): void {
    if (!confirm(`Czy na pewno chcesz anulować wypożyczenie przyczepy ${rental.trailerInfo}?`)) {
      return;
    }

    this.rentalsSvc
      .cancel(rental.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Wypożyczenie zostało anulowane', 'OK', { duration: 4000 });
          this.loadMyRentals();
        },
        error: (error) => {
          console.error('Error cancelling rental:', error);
          this.snack.open('Nie udało się anulować wypożyczenia', 'OK', { duration: 5000 });
        },
      });
  }

  public canCancel(rental: Rental): boolean {
    const cancelableStatuses: RentalStatus[] = ['Oczekujaca', 'Odrzucona'];
    if (!cancelableStatuses.includes(rental.status)) {
      return false;
    }
    const startDate = new Date(rental.startDate);
    const utcNow = new Date();

    const twentyFourHoursAfterStart = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    return utcNow <= twentyFourHoursAfterStart;
  }
  public getStatusColor(status: RentalStatus | 'ALL'): string {
    const statusMap: Record<RentalStatus | 'ALL', string> = {
      ALL: '',
      Oczekujaca: 'accent',
      Zatwierdzona: 'primary',
      Aktywna: 'primary',
      Zakonczona: '',
      Anulowana: 'warn',
      Odrzucona: 'warn',
    };
    return statusMap[status];
  }

  public getStatusIcon(status: RentalStatus): string {
    const iconMap: Record<RentalStatus, string> = {
      Oczekujaca: 'hourglass_empty',
      Zatwierdzona: 'check_circle',
      Aktywna: 'play_circle',
      Zakonczona: 'done_all',
      Anulowana: 'cancel',
      Odrzucona: 'block',
    };
    return iconMap[status];
  }

  public formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pl-PL');
  }

  public calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public isStartingSoon(rental: Rental): boolean {
    const startDate = new Date(rental.startDate);
    const today = this.currentDate();
    return startDate > today;
  }

  public isActive(rental: Rental): boolean {
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    const today = this.currentDate();
    return startDate <= today && endDate >= today && rental.status === 'Aktywna';
  }

  public isCompleted(rental: Rental): boolean {
    const endDate = new Date(rental.endDate);
    const today = this.currentDate();
    return endDate < today && rental.status === 'Zakonczona';
  }

  public getStartDateBadgeText(rental: Rental): string {
    return `Rozpocznie się ${this.formatDate(rental.startDate)}`;
  }

  public navigateToTrailer(trailerId: number): void {
    this.router.navigate(['/trailers'], { queryParams: { id: trailerId } });
  }

  public trackByRentalId(index: number, rental: Rental): number {
    return rental.id;
  }

  public parseTrailerInfo(trailerInfo: string): {
    brand: string;
    model: string;
    registration: string;
  } {
    const match = trailerInfo.match(/^(.+?)\s+\((.+)\)$/);
    if (match) {
      const [_, brandModel, registration] = match;
      const brandModelParts = brandModel.split(' ');
      const brand = brandModelParts[0] || '';
      const model = brandModelParts.slice(1).join(' ') || '';
      return { brand, model, registration };
    }
    return { brand: trailerInfo, model: '', registration: '' };
  }

  // Helper do pobrania etykiety dla wybranego statusu
  public getSelectedStatusLabel(): string {
    const selected = this.statusOptions.find((opt) => opt.value === this.selectedStatus());
    return selected?.label || 'Wszystkie statusy';
  }
}
