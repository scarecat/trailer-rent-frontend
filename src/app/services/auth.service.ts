import { Injectable, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginDto, RegisterDto, UpdateProfileDto, User } from '../models/models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  // Sygnały
  private userSignal = signal<AuthResponse | null>(this.loadUser());

  // Sygnały publiczne (tylko do odczytu)
  public user = this.userSignal.asReadonly();

  // Sygnały obliczeniowe
  public isLoggedIn = computed(() => !!this.userSignal());
  public isAdmin = computed(() => this.userSignal()?.role === 'Administrator');
  public currentUser = computed(() => this.userSignal());
  public token = computed(() => this.userSignal()?.token ?? null);

  constructor() {
    // Efekt do synchronizacji z localStorage (opcjonalny)
    effect(() => {
      const user = this.userSignal();
      if (user) {
        localStorage.setItem(this.TOKEN_KEY, user.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
      }
    });
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, dto)
      .pipe(tap((res) => this.setSession(res)));
  }

  edit(dto: UpdateProfileDto): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${environment.apiUrl}/auth/profile`, dto)
      .pipe(tap((res) => this.setSession(res)));
  }

  getInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/info`);
  }

  logout(): void {
    this.userSignal.set(null);
  }

  delete(): Observable<object> {
    return this.http.delete(`${environment.apiUrl}/auth`).pipe(
      tap((_) => {
        this.setSession(null);
      }),
    );
  }
  changePassword(dto: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, dto);
  }
  private setSession(res: AuthResponse | null): void {
    this.userSignal.set(res);
  }
}
