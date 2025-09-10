import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { OverlayService } from '../../../shared/services/overlay.service';
import { User } from '../../../shared/models/database.model';
import { FirestoreService } from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: '',
    name: '',
    email: '',
    profilePictureUrl: '',
    joinedAt: '',
    onlineStatus: false,
  };
  isOwnProfile: boolean = true;
  isEditModeActive: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private firestore: FirestoreService,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.firestore.selectedUserId$
      .pipe(
        switchMap((userId) =>
          combineLatest([
            this.firestore.getUser(userId),
            this.firestore.loggedInUserId$,
          ])
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([user, loggedInUser]) => {
        this.user = user;
        this.isOwnProfile = user.id === loggedInUser;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveEdit(newName: string) {
    this.firestore
      .updateUserName(this.user.id, newName)
      .catch((error) => console.error(error));
    this.isEditModeActive = false;
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
