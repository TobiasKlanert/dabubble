import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../services/overlay.service';
import { AddChannelMenuComponent } from './add-channel-menu/add-channel-menu.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [CommonModule, AddChannelMenuComponent, ProfileMenuComponent, ProfileComponent],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
})
export class OverlayComponent {
  overlayOpen: boolean = true;

  constructor(public overlayService: OverlayService) {
    this.overlayService.overlayOpen$.subscribe((open) => {
      this.overlayOpen = open;
    });
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
