import { Component } from '@angular/core';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin-toolbar',
  imports: [MatToolbar, RouterLink, RouterLinkActive, MatToolbarModule, MatTabsModule],
  templateUrl: './admin-toolbar.html',
  styleUrl: './admin-toolbar.scss',
})
export class AdminToolbar {}
