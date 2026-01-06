import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OverlayService } from '../../../../services/overlay.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { ScreenService } from '../../../../services/screen.service';
import { OverlayType } from '../../../../models/chat.enums';
import { SessionCleanupService } from '../../../../services/session-cleanup.service';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {
  userId: string = '';
  overlayType: OverlayType = OverlayType.Normal;
  OverlayType = OverlayType;
  private destroy$ = new Subject<void>();

  constructor(
    private firestore: FirestoreService,
    private overlayService: OverlayService,
    private router: Router,
    private screenService: ScreenService,
    private sessionCleanup: SessionCleanupService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userId) => {
        this.userId = userId;
      });

    this.screenService.isMobile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.overlayType = OverlayType.Flap;
        } else {
          this.overlayType = OverlayType.Normal;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  async onLogout() {
    try {
      this.overlayService.close();
      this.firestore.setOnlineStatus(this.firestore.loggedInUserId, false);
      await this.firestore.logout();
      this.sessionCleanup.cleanupSession();
      this.router.navigate([''], { replaceUrl: true });
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);
    }
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
