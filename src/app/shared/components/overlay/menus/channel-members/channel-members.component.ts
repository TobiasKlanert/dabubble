import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { OverlayService } from '../../../../services/overlay.service';
import { User } from '../../../../models/database.model';
import { FirestoreService } from '../../../../services/firestore.service';
import { ChatService } from '../../../../services/chat.service';
import { ScreenService } from '../../../../services/screen.service';
import { ChatType, OverlayType } from '../../../../models/chat.enums';

@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss',
})
export class ChannelMembersComponent {
  channelId: string = '';
  overlayType: OverlayType = OverlayType.Normal;
  OverlayType = OverlayType;

  channelMembers: User[] = [];

  private destroy$ = new Subject<void>();

  @Input() callFromChannelInfo: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private screenService: ScreenService
  ) {}

  ngOnInit() {
    // Kombiniere ChatId- und ScreenService-Subscription in einer Subscription
    this.chatService.selectedChatId$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((chatId) => {
          this.channelId = chatId;
          if (chatId) {
            return this.firestore.getChannelMembers(chatId, ChatType.Channel);
          }
          return [];
        }),
        tap((members) => (this.channelMembers = members)),
        switchMap(() => this.screenService.isMobile$),
        tap((isMobile) => {
          this.overlayType = isMobile ? OverlayType.FullSize : OverlayType.Normal;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  openAddUserDialog() {
    this.overlayService.open('addUser');
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
