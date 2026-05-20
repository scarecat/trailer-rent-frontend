import { Component, OnInit, inject, signal, computed, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrailersService } from '../../services/trailers.service';
import { AuthService } from '../../services/auth.service';
import { Trailer } from '../../models/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, finalize, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-trailer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './trailer.page.html',
  styleUrls: ['./trailer.page.scss'],
})
export class TrailerPage implements OnInit, OnDestroy {
  private trailersSvc = inject(TrailersService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  public auth = inject(AuthService);

  public trailers = signal<Trailer[]>([]);
  public loading = signal<boolean>(false);

  public filterForm: FormGroup<{
    type: FormControl<string | null>;
    maxPrice: FormControl<string | null>;
  }>;

  private readonly TRAILER_TYPES = [
    'Cargo',
    'Motorboat',
    'Flatbed',
    'Refrigerated',
    'Other',
  ] as const;
  private readonly TRAILER_STATUSES = ['Dostepna', 'Wypozyczona', 'WSerwisie', 'Wycofana'] as const;

  private readonly TYPE_LABEL_MAP: Readonly<Record<string, string>> = {
    Cargo: 'Cargo',
    Motorboat: 'Motorowodna',
    Flatbed: 'Platforma',
    Refrigerated: 'Chlodnia',
    Other: 'Inna',
  };

  private readonly STATUS_COLOR_MAP: Readonly<Record<string, string>> = {
    Dostepna: 'primary',
    Wypozyczona: 'accent',
    WSerwisie: 'warn',
    Wycofana: '',
  };

  private readonly STATUS_LABEL_MAP: Readonly<Record<string, string>> = {
    Dostepna: 'Dostepna',
    Wypozyczona: 'Wypozyczona',
    WSerwisie: 'W serwisie',
    Wycofana: 'Wycofana',
  };

  public readonly trailerTypes = signal(this.TRAILER_TYPES);
  public readonly trailerStatuses = signal(this.TRAILER_STATUSES);

  constructor() {
    this.filterForm = this.fb.group({
      type: [''],
      maxPrice: [''],
    });

    this.setupFilterSubscription();
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {}

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.load();
      });
  }

  public load(): void {
    this.loading.set(true);

    const { type, maxPrice } = this.filterForm.getRawValue();
    const filters: Partial<{ type: string; status: string; maxPrice: number }> = {
      status: 'Dostepna',
    };

    if (type) filters.type = type;
    if (maxPrice && !isNaN(Number(maxPrice))) filters.maxPrice = Number(maxPrice);

    this.trailersSvc
      .getAll(filters)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.trailers.set(data);
        },
        error: (error) => {
          this.snack.open('Nie udało się załadować przyczep', 'Zamknij', { duration: 5000 });
          console.error('Error loading trailers:', error);
        },
      });
  }

  public reset(): void {
    this.filterForm.patchValue({ type: '', maxPrice: '' }, { emitEvent: false });
    this.load();
  }

  public reserve(trailer: Trailer): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/rentals/new'], {
      queryParams: { trailerId: trailer.id },
    });
  }

  public statusColor(status: string): string {
    return this.STATUS_COLOR_MAP[status] || '';
  }

  public statusLabel(status: string): string {
    return this.STATUS_LABEL_MAP[status] || status;
  }

  public typeLabel(type: string): string {
    return this.TYPE_LABEL_MAP[type] || type;
  }

  public trackByTrailerId(index: number, trailer: Trailer): number {
    return trailer.id;
  }
}
