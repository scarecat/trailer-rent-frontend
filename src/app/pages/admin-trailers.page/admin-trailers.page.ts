import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { TrailersService } from '../../services/trailers.service';
import { Trailer } from '../../models/models';

/* ─── Confirm-delete dialog ──────────────────────────────────── */
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dialog-wrap">
      <div class="dialog-icon">
        <mat-icon>delete_forever</mat-icon>
      </div>
      <h2 mat-dialog-title>Usunąć przyczepę?</h2>
      <mat-dialog-content>
        <p>
          Czy na pewno chcesz usunąć
          <strong>{{ data.brand }} {{ data.model }}</strong>
          ({{ data.registrationNumber }})?
        </p>
        <p class="dialog-warning">Ta operacja jest nieodwracalna.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button [mat-dialog-close]="false">Anuluj</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true">
          <mat-icon>delete</mat-icon> Usuń
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-wrap {
        padding: 8px 24px 16px;
        max-width: 400px;
      }
      .dialog-icon {
        display: flex;
        justify-content: center;
        margin: 16px 0 8px;
      }
      .dialog-icon mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-error);
      }
      h2[mat-dialog-title] {
        text-align: center;
        margin: 0 0 8px;
      }
      mat-dialog-content p {
        margin: 4px 0;
        text-align: center;
      }
      .dialog-warning {
        font-size: 13px;
        color: var(--mat-sys-on-surface-variant);
      }
      mat-dialog-actions {
        padding-bottom: 8px;
        gap: 8px;
      }
    `,
  ],
})
export class ConfirmDeleteDialogComponent {
  data = inject<{ brand: string; model: string; registrationNumber: string }>(MAT_DIALOG_DATA);
}

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  Cargo: { label: 'Ładunkowa', icon: 'inventory_2', color: '#1565C0' },
  Motorboat: { label: 'Łódź motorowa', icon: 'sailing', color: '#00838F' },
  Flatbed: { label: 'Platforma', icon: 'view_agenda', color: '#6A1B9A' },
  Refrigerated: { label: 'Chłodnicza', icon: 'ac_unit', color: '#00695C' },
  Other: { label: 'Inna', icon: 'more_horiz', color: '#4E342E' },
};

const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  Dostepna: { label: 'Dostępna', icon: 'check_circle', color: '#2E7D32' },
  Wypozyczona: { label: 'Wypożyczona', icon: 'event_busy', color: '#EF6C00' },
  WSerwisie: { label: 'W serwisie', icon: 'build', color: '#1565C0' },
  Wycofana: { label: 'Wycofana', icon: 'block', color: '#C62828' },
};

/* ─── Main page ──────────────────────────────────────────────── */
@Component({
  selector: 'app-admin-trailers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatBadgeModule,
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-text">
          <span class="header-eyebrow">Panel administracyjny</span>
          <h1 class="header-title">Przyczepy</h1>
        </div>
        <button mat-flat-button class="add-btn" (click)="goToAdd()">
          <mat-icon>add</mat-icon>
          Dodaj przyczepę
        </button>
      </div>

      <mat-divider />

      <!-- Filters bar -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="filter-search">
          <mat-label>Szukaj</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="searchQuery" placeholder="Marka, model, nr rej…" />
          @if (searchQuery) {
            <button matSuffix mat-icon-button (click)="searchQuery = ''" matTooltip="Wyczyść">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-type">
          <mat-label>Typ</mat-label>
          <mat-select [(ngModel)]="filterType">
            <mat-option value="">Wszystkie</mat-option>
            @for (t of typeOptions; track t.value) {
              <mat-option [value]="t.value">
                <span class="type-opt">
                  <mat-icon class="type-opt-icon">{{ t.icon }}</mat-icon
                  >{{ t.label }}
                </span>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <!-- States -->
      @if (loading()) {
        <div class="state-center">
          <mat-spinner diameter="48" />
          <p>Ładowanie przyczep…</p>
        </div>
      } @else if (error()) {
        <div class="state-center state-error">
          <mat-icon>error_outline</mat-icon>
          <p>Nie udało się załadować listy przyczep.</p>
          <button mat-stroked-button (click)="loadTrailers()">
            <mat-icon>refresh</mat-icon> Spróbuj ponownie
          </button>
        </div>
      } @else if (filtered().length === 0 && trailers().length === 0) {
        <div class="state-center state-empty">
          <mat-icon>local_shipping</mat-icon>
          <p>Brak przyczep w systemie.</p>
          <button mat-flat-button (click)="goToAdd()">
            <mat-icon>add</mat-icon> Dodaj pierwszą przyczepę
          </button>
        </div>
      } @else if (filtered().length === 0) {
        <div class="state-center state-empty">
          <mat-icon>search_off</mat-icon>
          <p>Brak wyników dla podanych filtrów.</p>
          <button mat-stroked-button (click)="clearFilters()">
            <mat-icon>filter_alt_off</mat-icon> Wyczyść filtry
          </button>
        </div>
      } @else {
        <!-- Stats strip -->
        <div class="stats-strip">
          <span class="stats-count">
            {{ filtered().length }}
            {{
              filtered().length === 1
                ? 'przyczepa'
                : filtered().length < 5
                  ? 'przyczepy'
                  : 'przyczep'
            }}
          </span>
          @if (isFiltered()) {
            <span class="stats-filtered">(filtrowanie aktywne)</span>
          }
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table class="trailers-table">
            <thead>
              <tr>
                <th>Pojazd</th>
                <th>Nr rejestracyjny</th>
                <th>Typ</th>
                <th>Status</th>
                <th class="num-col">Ładowność</th>
                <th class="num-col">Cena / dzień</th>
                <th class="actions-col">Akcje</th>
              </tr>
            </thead>
            <tbody>
              @for (trailer of filtered(); track trailer.id) {
                <tr class="trailer-row" [class.deleting]="deletingId() === trailer.id">
                  <td class="vehicle-cell">
                    <div class="vehicle-name">{{ trailer.brand }} {{ trailer.model }}</div>
                    @if (trailer.description) {
                      <div class="vehicle-desc" [title]="trailer.description">
                        {{ trailer.description }}
                      </div>
                    }
                  </td>
                  <td>
                    <span class="reg-badge">{{ trailer.registrationNumber }}</span>
                  </td>
                  <td>
                    <span class="type-chip" [style.--chip-color]="typeMeta(trailer.type).color">
                      <mat-icon class="chip-icon">{{ typeMeta(trailer.type).icon }}</mat-icon>
                      {{ typeMeta(trailer.type).label }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="status-chip"
                      [style.--chip-color]="statusMeta(trailer.status).color"
                    >
                      <mat-icon class="chip-icon">{{ statusMeta(trailer.status).icon }}</mat-icon>
                      {{ statusMeta(trailer.status).label }}
                    </span>
                  </td>
                  <td class="num-col">
                    <span class="num-value">{{ trailer.loadCapacity | number: '1.0-0' }}</span>
                    <span class="num-unit">kg</span>
                  </td>
                  <td class="num-col">
                    <span class="num-value">{{ trailer.pricePerDay | number: '1.0-0' }}</span>
                    <span class="num-unit">PLN</span>
                  </td>
                  <td class="actions-col">
                    <div class="row-actions">
                      <button
                        mat-icon-button
                        matTooltip="Edytuj"
                        (click)="goToEdit(trailer.id)"
                        [disabled]="deletingId() === trailer.id || trailer.status == 'Wypozyczona'"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        class="delete-btn"
                        matTooltip="Usuń"
                        (click)="confirmDelete(trailer)"
                        [disabled]="deletingId() === trailer.id || trailer.status == 'Wypozyczona'"
                      >
                        @if (deletingId() === trailer.id) {
                          <mat-spinner diameter="20" />
                        } @else {
                          <mat-icon>delete_outline</mat-icon>
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-wrapper {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px 24px 64px;
      }

      /* Header */
      .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .header-eyebrow {
        display: block;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--mat-sys-primary);
        line-height: 1;
        margin-bottom: 4px;
      }
      .header-title {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        line-height: 1.2;
      }
      .add-btn mat-icon {
        margin-right: 4px;
      }

      /* Filters */
      .filters-bar {
        display: flex;
        gap: 16px;
        margin: 24px 0 8px;
        flex-wrap: wrap;
      }
      .filter-search {
        flex: 1 1 260px;
      }
      .filter-type {
        flex: 0 1 200px;
      }

      .type-opt {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .type-opt-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-primary);
      }

      /* Stats strip */
      .stats-strip {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0 12px;
        font-size: 13px;
      }
      .stats-count {
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }
      .stats-filtered {
        color: var(--mat-sys-on-surface-variant);
      }

      /* States */
      .state-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 80px 24px;
        color: var(--mat-sys-on-surface-variant);
      }
      .state-center mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        opacity: 0.4;
      }
      .state-center p {
        margin: 0;
        font-size: 15px;
      }
      .state-error mat-icon {
        color: var(--mat-sys-error);
        opacity: 1;
      }

      /* Table */
      .table-wrapper {
        overflow-x: auto;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 12px;
      }
      .trailers-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      .trailers-table thead tr {
        background: var(--mat-sys-surface-container);
      }
      .trailers-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
        white-space: nowrap;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }
      .trailers-table td {
        padding: 14px 16px;
        vertical-align: middle;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-surface);
      }
      .trailer-row:last-child td {
        border-bottom: none;
      }
      .trailer-row {
        transition: background 0.15s;
      }
      .trailer-row:hover {
        background: var(--mat-sys-surface-container-low);
      }
      .trailer-row.deleting {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Vehicle cell */
      .vehicle-name {
        font-weight: 600;
      }
      .vehicle-desc {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-top: 2px;
      }

      /* Reg badge */
      .reg-badge {
        display: inline-block;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        background: var(--mat-sys-surface-container);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 6px;
        padding: 3px 8px;
      }

      /* Type chip */
      .type-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 13px;
        font-weight: 500;
        color: var(--chip-color);
        background: color-mix(in srgb, var(--chip-color) 10%, transparent);
        border-radius: 99px;
        padding: 3px 10px 3px 6px;
        white-space: nowrap;
      }
      .chip-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }

      /* Numeric columns */
      .num-col {
        text-align: right;
      }
      .num-value {
        font-weight: 600;
      }
      .num-unit {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant);
        margin-left: 3px;
      }

      /* Actions */
      .actions-col {
        text-align: center;
        width: 100px;
      }
      .row-actions {
        display: flex;
        justify-content: center;
        gap: 4px;
      }
      .delete-btn {
        color: var(--mat-sys-error);
      }

      /* Responsive */
      @media (max-width: 640px) {
        .page-wrapper {
          padding: 16px 12px 48px;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }
        .add-btn {
          width: 100%;
          justify-content: center;
        }
        .filters-bar {
          flex-direction: column;
        }
        .filter-search,
        .filter-type {
          flex: unset;
          width: 100%;
        }
      }
    `,
  ],
})
export class AdminTrailersPage implements OnInit {
  private trailersService = inject(TrailersService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  trailers = signal<Trailer[]>([]);
  loading = signal(true);
  error = signal(false);
  deletingId = signal<number | null>(null);

  searchQuery = '';
  filterType = '';

  typeOptions = Object.entries(TYPE_META).map(([value, meta]) => ({
    value,
    label: meta.label,
    icon: meta.icon,
  }));

  filtered = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const type = this.filterType;
    return this.trailers().filter((t) => {
      const matchSearch =
        !q ||
        t.brand.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q) ||
        t.registrationNumber.toLowerCase().includes(q);
      const matchType = !type || t.type === type;
      return matchSearch && matchType;
    });
  });

  isFiltered = computed(() => !!this.searchQuery.trim() || !!this.filterType);

  typeMeta(type: string) {
    return TYPE_META[type] ?? TYPE_META['Other'];
  }

  statusMeta(status: string) {
    return STATUS_META[status] ?? STATUS_META['Dostepna'];
  }

  ngOnInit(): void {
    this.loadTrailers();
  }

  loadTrailers(): void {
    this.loading.set(true);
    this.error.set(false);
    this.trailersService.getAll().subscribe({
      next: (list) => {
        this.trailers.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  confirmDelete(trailer: Trailer): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: {
        brand: trailer.brand,
        model: trailer.model,
        registrationNumber: trailer.registrationNumber,
      },
      width: '420px',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.deleteTrailer(trailer.id);
    });
  }

  private deleteTrailer(id: number): void {
    this.deletingId.set(id);
    this.trailersService.delete(id).subscribe({
      next: () => {
        this.trailers.update((list) => list.filter((t) => t.id !== id));
        this.deletingId.set(null);
        this.snackBar.open('Przyczepa została usunięta.', 'OK', { duration: 3500 });
      },
      error: () => {
        this.deletingId.set(null);
        this.snackBar.open('Nie udało się usunąć przyczepy.', 'Zamknij', { duration: 5000 });
      },
    });
  }

  goToAdd(): void {
    this.router.navigate(['/admin/trailers/add']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/admin/trailers', id, 'edit']);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterType = '';
  }
}
