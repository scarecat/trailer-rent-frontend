import { Component, inject, signal, computed, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div style="display: flex; flex-direction: row; justify-content: space-between">
      <div class="header">
        <h1>Klienci</h1>
        <p>Zarządzanie kontami klientów</p>
      </div>
      <button mat-raised-button routerLink="/admin/add-employee"> Dodaj pracownika </button>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="search">
        <mat-label>Szukaj</mat-label>
        <input
          matInput
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterUsers()"
          placeholder="Imię, nazwisko lub email"
        />
      </mat-form-field>

      <!-- Stats -->
      <div class="stats">
        <mat-card>
          <div class="stat-value">{{ users().length }}</div>
          <div class="stat-label">Wszyscy</div>
        </mat-card>
        <mat-card>
          <div class="stat-value">{{ activeCount() }}</div>
          <div class="stat-label">Aktywni</div>
        </mat-card>
        <mat-card>
          <div class="stat-value">{{ blockedCount() }}</div>
          <div class="stat-label">Zablokowani</div>
        </mat-card>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }

      <!-- Table -->
      @if (!loading() && filteredUsers().length > 0) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredUsers()" class="table">
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Użytkownik</th>
              <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="phoneNumber">
              <th mat-header-cell *matHeaderCellDef>Telefon</th>
              <td mat-cell *matCellDef="let user">{{ user.phoneNumber }}</td>
            </ng-container>


            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip [color]="user.isActive ? '' : 'warn'" highlighted>
                  {{ user.isActive ? 'Aktywny' : 'Zablokowany' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let user">
                @if (user.isActive) {
                  <button mat-raised-button color="warn" (click)="blockUser(user)">Zablokuj</button>
                } @else {
                  <button mat-raised-button color="primary" (click)="unblockUser(user)">
                    Odblokuj
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      }

      <!-- Empty -->
      @if (!loading() && filteredUsers().length === 0) {
        <mat-card class="empty">
          <p>Brak użytkowników</p>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .header {
        margin-bottom: 24px;
      }

      .header h1 {
        margin: 0 0 4px 0;
        font-size: 24px;
        font-weight: 500;
      }

      .header p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }

      .search {
        width: 100%;
        margin-bottom: 24px;
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .stats mat-card {
        text-align: center;
        padding: 16px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
      }

      .stat-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 4px;
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 48px;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .table {
        width: 100%;
      }

      .empty {
        text-align: center;
        padding: 48px;
        color: rgba(0, 0, 0, 0.5);
      }

      @media (max-width: 768px) {
        .container {
          padding: 16px;
        }

        .stats {
          gap: 12px;
        }

        .stat-value {
          font-size: 22px;
        }
      }
    `,
  ],
})
export class AdminClientsPage implements OnInit {
  private usersSvc = inject(UsersService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  public users = signal<User[]>([]);
  public filtered = signal<User[]>([]);
  public loading = signal<boolean>(false);
  public searchTerm = '';

  public displayedColumns = ['fullName', 'email', 'phoneNumber', 'status', 'actions'];

  public activeCount = computed(() => this.users().filter((u) => u.isActive).length);

  public blockedCount = computed(() => this.users().filter((u) => !u.isActive).length);

  public filteredUsers = computed(() => this.filtered());

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);

    this.usersSvc
      .getAllClients()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.filterUsers();
        },
        error: () => {
          this.snack.open('Błąd ładowania', 'OK', { duration: 3000 });
        },
      });
  }

  public filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filtered.set(this.users());
      return;
    }

    const filtered = this.users().filter(
      (user) =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
    this.filtered.set(filtered);
  }

  public blockUser(user: User): void {
    this.usersSvc
      .block(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open(`Zablokowano ${user.firstName} ${user.lastName}`, 'OK', {
            duration: 3000,
          });
          this.loadUsers();
        },
        error: () => {
          this.snack.open('Błąd blokowania', 'OK', { duration: 3000 });
        },
      });
  }

  public unblockUser(user: User): void {
    this.usersSvc
      .unblock(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snack.open(`Odblokowano ${user.firstName} ${user.lastName}`, 'OK', {
            duration: 3000,
          });
          this.loadUsers();
        },
        error: () => {
          this.snack.open('Błąd odblokowania', 'OK', { duration: 3000 });
        },
      });
  }
}
