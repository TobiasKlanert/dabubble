import { Component } from '@angular/core';
import { OverlayService } from '../../../shared/services/overlay.service';
import { ProfileService } from '../../../shared/services/profile.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  constructor(
    private overlayService: OverlayService,
    private profileService: ProfileService
  ) {}

  openProfile(userId: string) {
    this.profileService.openUserProfile(userId);
  }

  logout() {
    //Placeholder
    this.overlayService.close();
    console.log('Logout');
  }
}
