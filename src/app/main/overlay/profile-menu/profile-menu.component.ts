import { Component } from '@angular/core';
import { OverlayService } from '../../../shared/services/overlay.service';
import { FirestoreService } from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  userId: string = '';

  constructor(
    private firestore: FirestoreService,
    private overlayService: OverlayService,
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$.subscribe((userId) => {
      this.userId = userId;
    })
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  // TODO: implement logout method
  logout() {
    this.overlayService.close();
    console.log('Logout');
  }
}
