import { Component } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { OverlayService } from '../../../shared/services/overlay.service';

@Component({
  selector: 'app-avatar-editor',
  standalone: true,
  imports: [],
  templateUrl: './avatar-editor.component.html',
  styleUrl: './avatar-editor.component.scss',
})
export class AvatarEditorComponent {
  selectedAvatar = '';
  formData: any;
  loading = false;

  private destroy$ = new Subject<void>();

  avatars: string[] = [
    '/assets/img/user1.png',
    '/assets/img/user2.png',
    '/assets/img/user3.png',
    '/assets/img/user4.png',
    '/assets/img/user5.png',
    '/assets/img/user6.png',
  ];

  constructor(private firestore: FirestoreService, private overlayService: OverlayService) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((id) => this.firestore.getUser(id))
      )
      .subscribe((user) => {
        this.selectedAvatar = user.profilePictureUrl;
      });
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  get isAvatarChosen(): boolean {
    return this.selectedAvatar !== '';
  }

  quitAvatarEditor() {
    this.overlayService.open('profile');
  }

  closeOverlay() {
    this.overlayService.close();
  }

  saveNewAvatar() {
    this.firestore.updateUserAvatar(this.selectedAvatar);
    this.overlayService.open('profile');
  }
}
