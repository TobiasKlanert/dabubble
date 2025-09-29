import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import { OverlayService } from '../../../shared/services/overlay.service';
import { ChatPartner, User } from '../../../shared/models/database.model';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { ChatService } from '../../../shared/services/chat.service';
import { ChatType } from '../../../shared/models/chat.enums';

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
  chatPartner: ChatPartner = {
    id: '',
    name: '',
    onlineStatus: false,
    profilePictureUrl: '',
  };
  isOwnProfile: boolean = true;
  isEditModeActive: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private firestore: FirestoreService,
    private chatService: ChatService,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.firestore.selectedUserId$
      .pipe(
        switchMap((userId) =>
          combineLatest([
            this.firestore.getUserLive(userId),
            this.firestore.loggedInUserId$,
          ])
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(([user, loggedInUser]) => {
        this.user = { ...user };
        this.chatPartner = {
          id: user.id,
          name: user.name,
          onlineStatus: user.onlineStatus,
          profilePictureUrl: user.profilePictureUrl,
        };
        this.isOwnProfile = user.id === loggedInUser;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showAvatarEditor() {
    this.overlayService.open('avatarEditor');
  }

  saveEdit(newName: string) {
    if (newName) {
      this.firestore
        .updateUserName(this.user.id, newName)
        .catch((error) => console.error(error));
    }
    this.isEditModeActive = false;
  }

  async openDirectChat(partnerId: string) {
    const chatId = await this.firestore.getOrCreateDirectChatId(
      this.firestore.loggedInUserId,
      partnerId
    );
    this.chatService.selectChatId(chatId);
    this.chatService.selectChatType(ChatType.DirectMessage);
    this.chatService.selectChatPartner(this.chatPartner);
    this.closeOverlay();
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
