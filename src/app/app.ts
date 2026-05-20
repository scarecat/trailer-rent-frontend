import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AdminToolbar } from './components/admin-toolbar/admin-toolbar';
import { AuthService } from './services/auth.service';
import { UserToolbar } from './components/user-toolbar/user-toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, AdminToolbar, UserToolbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('trailer-rent-frontend');
  private auth = inject(AuthService);
  protected admin = this.auth.isAdmin;
  protected loggedIn = this.auth.isLoggedIn;
}
