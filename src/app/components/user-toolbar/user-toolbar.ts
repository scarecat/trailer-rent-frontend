import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-user-toolbar',
  imports: [MatToolbarModule, MatTabsModule, RouterLinkActive, RouterLink],
  templateUrl: './user-toolbar.html',
  styleUrl: './user-toolbar.scss',
})
export class UserToolbar {}
