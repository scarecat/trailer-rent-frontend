import { Component, computed, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-toolbar',
  imports: [MatToolbarModule, MatTabsModule, RouterLinkActive, RouterLink],
  templateUrl: './user-toolbar.html',
  styleUrl: './user-toolbar.scss',
})
export class UserToolbar {
  private auth = inject(AuthService);
  protected username = computed(() => this.auth.user()?.fullName ?? '');
}
