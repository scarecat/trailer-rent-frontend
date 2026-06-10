import { Component } from '@angular/core';
import { ProfileEditComponent } from '../../components/profile-edit/profile-edit.component';

@Component({
  selector: 'app-profile.page',
  imports: [ProfileEditComponent],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {}
