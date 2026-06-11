import { Component, inject, signal, computed, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
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
  selector: 'reject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Odrzuć rezerwację</h2>
    <form [formGroup]="form">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Powód odrzucenia</mat-label>
          <textarea matInput formControlName="note" rows="3"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Anuluj</button>
        <button mat-raised-button color="warn" (click)="submit()">Odrzuć</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: ['.full-width { width: 100%; min-width: 300px; }'],
})
export class RejectDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RejectDialogComponent>,
  ) {
    this.form = this.fb.group({ note: [''] });
  }

  submit(): void {
    this.dialogRef.close(this.form.value.note);
  }
}

@Component({
  selector: 'app-admin-rentals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTabsModule,
  ],
  templateUrl: './admin-rentals.page.html',
  styleUrls: ['./admin-rentals.page.scss'],
})
export class AdminRentalsPage implements OnInit {
  private rentalsSvc = inject(RentalsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  public allRentals = signal<Rental[]>([]);
  public filteredRentals = signal<Rental[]>([]);
  public loading = signal<boolean>(false);
  public selectedTab = signal<number>(0);

  public tabs = [
    { label: 'Wszystkie', status: 'ALL' },
    { label: 'Do zatwierdzenia', status: 'Oczekujaca' },
    { label: 'Zatwierdzone', status: 'Zatwierdzona' },
    { label: 'Aktywne', status: 'Aktywna' },
  ];

  public hasRentals = computed(() => this.filteredRentals().length > 0);

  public pendingCount = computed(
    () => this.allRentals().filter((r) => r.status === 'Oczekujaca').length,
  );

  constructor() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.loadAllRentals();
  }

  private loadAllRentals(): void {
    this.loading.set(true);

    this.rentalsSvc
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rentals) => {
          this.allRentals.set(rentals);
          this.applyFilters();
        },
        error: () => {
          this.snack.open('Nie udało się załadować rezerwacji', 'OK', { duration: 5000 });
        },
      });
  }

  public onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.applyFilters();
  }

  public applyFilters(): void {
    const status = this.tabs[this.selectedTab()].status;
    if (status === 'ALL') {
      this.filteredRentals.set(this.allRentals());
    } else {
      this.filteredRentals.set(this.allRentals().filter((r) => r.status === status));
    }
  }

  public approveRental(rental: Rental): void {
    this.rentalsSvc
      .approve(rental.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open('Rezerwacja zatwierdzona', 'OK', { duration: 4000 });
          this.loadAllRentals();
        },
        error: () => {
          this.snack.open('Błąd podczas zatwierdzania', 'OK', { duration: 5000 });
        },
      });
  }

  public rejectRental(rental: Rental): void {
    const dialogRef = this.dialog.open(RejectDialogComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((note: string | undefined) => {
        if (note !== undefined) {
          this.rentalsSvc.reject(rental.id, note).subscribe({
            next: () => {
              this.snack.open('Rezerwacja odrzucona', 'OK', { duration: 4000 });
              this.loadAllRentals();
            },
            error: () => {
              this.snack.open('Błąd podczas odrzucania', 'OK', { duration: 5000 });
            },
          });
        }
      });
  }

  public canApprove(rental: Rental): boolean {
    return rental.status === 'Oczekujaca';
  }

  public canReject(rental: Rental): boolean {
    return rental.status === 'Oczekujaca';
  }

  public getStatusColor(status: RentalStatus): string {
    const map: Record<RentalStatus, string> = {
      Oczekujaca: 'accent',
      Zatwierdzona: 'primary',
      Aktywna: 'primary',
      Zakonczona: '',
      Anulowana: 'warn',
      Odrzucona: 'warn',
    };
    return map[status];
  }

  public formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pl-PL');
  }

  public formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pl-PL');
  }

  public calculateDays(startDate: string, endDate: string): number {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public trackByRentalId(index: number, rental: Rental): number {
    return rental.id;
  }

pickupRental(rental: Rental): void {
  this.rentalsSvc
    .registerPickup(rental.id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.snack.open('Odbiór potwierdzony', 'OK', { duration: 4000 });
        this.loadAllRentals();
      },
      error: (err) =>
        this.snack.open(err.error?.message ?? 'Błąd odbioru', 'OK', { duration: 4000 }),
    });
}

returnRental(rental: Rental): void {
  this.rentalsSvc
    .registerReturn(rental.id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.snack.open('Zwrot potwierdzony', 'OK', { duration: 4000 });
        this.loadAllRentals();
      },
      error: (err) =>
        this.snack.open(err.error?.message ?? 'Błąd zwrotu', 'OK', { duration: 4000 }),
    });
}


public canPickup(rental: Rental): boolean {
  return rental.status === 'Zatwierdzona';
}

public canReturn(rental: Rental): boolean {
  return rental.status === 'Aktywna';
}

}



