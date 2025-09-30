import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayService } from '../../../../services/overlay.service';
import { FirestoreService } from '../../../../services/firestore.service';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$.subscribe((userId) => {
      this.userId = userId;
    });
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  async onLogout() {
    this.overlayService.close();
    this.firestore.setOnlineStatus(this.firestore.loggedInUserId, false);
    await this.firestore.logout();
    this.router.navigate(['']);
  }
}
