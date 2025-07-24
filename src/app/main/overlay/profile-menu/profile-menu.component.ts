import { Component } from '@angular/core';
import { OverlayService } from '../../../services/overlay.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  constructor(private overlayService: OverlayService) {}

  openProfile() {
    this.overlayService.open('profile');
  }

  logout() {
    //Placeholder
    this.overlayService.close();
    console.log('Logout');
  }
}
