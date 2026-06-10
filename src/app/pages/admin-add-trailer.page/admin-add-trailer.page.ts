import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { CreateTrailerDto } from '../../models/models';
import { TrailersService } from '../../services/trailers.service';

@Component({
  selector: 'app-admin-add-trailer-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  template: `
    <div class="page-wrapper">

      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button class="back-btn" (click)="goBack()" matTooltip="Wróć do listy">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-text">
          <span class="header-eyebrow">Panel administracyjny</span>
          <h1 class="header-title">Dodaj przyczepę</h1>
        </div>
      </div>

      <mat-divider />

      <!-- Form card -->
      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Section: Dane pojazdu -->
          <section class="form-section">
            <h2 class="section-label">
              <mat-icon class="section-icon">directions_car</mat-icon>
              Dane pojazdu
            </h2>
            <div class="fields-grid">

              <mat-form-field appearance="outline">
                <mat-label>Marka</mat-label>
                <input matInput formControlName="brand" placeholder="np. Niewiadów" />
                <mat-icon matSuffix>label</mat-icon>
                @if (form.get('brand')?.hasError('required') && form.get('brand')?.touched) {
                  <mat-error>Marka jest wymagana</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Model</mat-label>
                <input matInput formControlName="model" placeholder="np. T-25" />
                <mat-icon matSuffix>label_outline</mat-icon>
                @if (form.get('model')?.hasError('required') && form.get('model')?.touched) {
                  <mat-error>Model jest wymagany</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Numer rejestracyjny</mat-label>
                <input
                  matInput
                  formControlName="registrationNumber"
                  placeholder="np. KR 12345"
                  style="text-transform: uppercase"
                />
                <mat-icon matSuffix>pin</mat-icon>
                @if (form.get('registrationNumber')?.hasError('required') && form.get('registrationNumber')?.touched) {
                  <mat-error>Numer rejestracyjny jest wymagany</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Typ przyczepy</mat-label>
                <mat-select formControlName="type">
                  @for (type of types; track type.value) {
                    <mat-option [value]="type.value">
                      <span class="type-option">
                        <mat-icon class="type-icon">{{ type.icon }}</mat-icon>
                        {{ type.label }}
                      </span>
                    </mat-option>
                  }
                </mat-select>
                @if (form.get('type')?.hasError('required') && form.get('type')?.touched) {
                  <mat-error>Typ przyczepy jest wymagany</mat-error>
                }
              </mat-form-field>

            </div>
          </section>

          <!-- Section: Parametry techniczne -->
          <section class="form-section">
            <h2 class="section-label">
              <mat-icon class="section-icon">settings</mat-icon>
              Parametry techniczne
            </h2>
            <div class="fields-grid">

              <mat-form-field appearance="outline">
                <mat-label>Ładowność (kg)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="loadCapacity"
                  placeholder="np. 1500"
                  min="1"
                />
                <span matSuffix class="unit-suffix">kg</span>
                @if (form.get('loadCapacity')?.hasError('required') && form.get('loadCapacity')?.touched) {
                  <mat-error>Ładowność jest wymagana</mat-error>
                } @else if (form.get('loadCapacity')?.hasError('min') && form.get('loadCapacity')?.touched) {
                  <mat-error>Ładowność musi być większa od 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cena za dzień (PLN)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="pricePerDay"
                  placeholder="np. 120"
                  min="1"
                />
                <span matSuffix class="unit-suffix">PLN / dzień</span>
                @if (form.get('pricePerDay')?.hasError('required') && form.get('pricePerDay')?.touched) {
                  <mat-error>Cena jest wymagana</mat-error>
                } @else if (form.get('pricePerDay')?.hasError('min') && form.get('pricePerDay')?.touched) {
                  <mat-error>Cena musi być większa od 0</mat-error>
                }
              </mat-form-field>

            </div>
          </section>

          <!-- Section: Opis -->
          <section class="form-section">
            <h2 class="section-label">
              <mat-icon class="section-icon">notes</mat-icon>
              Opis <span class="optional-badge">opcjonalny</span>
            </h2>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Dodatkowe informacje o przyczepie</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="4"
                placeholder="Opisz stan przyczepy, wyposażenie, uwagi dla wynajmującego..."
              ></textarea>
              <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }} / 500</mat-hint>
              @if (form.get('description')?.hasError('maxlength')) {
                <mat-error>Opis nie może przekraczać 500 znaków</mat-error>
              }
            </mat-form-field>
          </section>

          <!-- Actions -->
          <div class="form-actions">
            <button mat-stroked-button type="button" (click)="goBack()" [disabled]="loading()">
              <mat-icon>close</mat-icon>
              Anuluj
            </button>
            <button
              mat-flat-button
              type="submit"
              class="submit-btn"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <mat-spinner diameter="18" color="accent" />
                Zapisywanie...
              } @else {
                <mat-icon>add_circle</mat-icon>
                Dodaj przyczepę
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      max-width: 820px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .back-btn {
      flex-shrink: 0;
      color: var(--mat-sys-on-surface-variant);
    }

    .header-text {
      display: flex;
      flex-direction: column;
    }

    .header-eyebrow {
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

    /* Form card */
    .form-card {
      margin-top: 28px;
      background: var(--mat-sys-surface-container-lowest, #fff);
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 16px;
      padding: 32px;
    }

    /* Sections */
    .form-section {
      margin-bottom: 32px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 20px;
    }

    .section-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-primary);
    }

    .optional-badge {
      font-size: 11px;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
      padding: 2px 8px;
      border-radius: 99px;
    }

    /* Grid */
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    /* Suffix / type option */
    .unit-suffix {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      padding-right: 4px;
    }

    .type-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .type-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--mat-sys-primary);
    }

    /* Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 24px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .submit-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .page-wrapper {
        padding: 16px 12px 48px;
      }

      .form-card {
        padding: 20px 16px;
      }

      .fields-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `],
})
export class AdminAddTrailerPage {
  private fb = inject(FormBuilder);
  private trailersService = inject(TrailersService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);

  types: { value: CreateTrailerDto['type']; label: string; icon: string }[] = [
    { value: 'Cargo',        label: 'Ładunkowa',       icon: 'inventory_2' },
    { value: 'Motorboat',    label: 'Łódź motorowa',   icon: 'sailing' },
    { value: 'Flatbed',      label: 'Platforma',       icon: 'view_agenda' },
    { value: 'Refrigerated', label: 'Chłodnicza',      icon: 'ac_unit' },
    { value: 'Other',        label: 'Inna',            icon: 'more_horiz' },
  ];

  form: FormGroup = this.fb.group({
    brand:              ['', Validators.required],
    model:              ['', Validators.required],
    registrationNumber: ['', Validators.required],
    type:               ['', Validators.required],
    loadCapacity:       [null, [Validators.required, Validators.min(1)]],
    pricePerDay:        [null, [Validators.required, Validators.min(1)]],
    description:        ['', Validators.maxLength(500)],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const dto: CreateTrailerDto = this.form.getRawValue();

    this.trailersService.create(dto).subscribe({
      next: () => {
        this.snackBar.open('Przyczepa została dodana pomyślnie.', 'OK', {
          duration: 4000,
          panelClass: ['snack-success'],
        });
        this.router.navigate(['/admin/trailers']);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Wystąpił błąd podczas dodawania przyczepy.', 'Zamknij', {
          duration: 5000,
          panelClass: ['snack-error'],
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/trailers']);
  }
}
