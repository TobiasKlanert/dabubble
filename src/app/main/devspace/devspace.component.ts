import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, switchMap, tap, takeUntil } from 'rxjs';
import { OverlayService } from '../../shared/services/overlay.service';
import {
  UserChatPreview,
  Channel,
  User,
  ChatPartner
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChatService } from '../../shared/services/chat.service';
import { ChatType } from '../../shared/models/chat.enums';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  public ChatType = ChatType;
  private destroy$ = new Subject<void>();

  userId: string = '';

  channelsOpen: boolean = true;
  messagesOpen: boolean = true;

  channels: Channel[] = [];
  chats: UserChatPreview[] = [];
  members: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        takeUntil(this.destroy$),
        tap((userId) => {
          this.userId = userId;
        }),
        switchMap((userId) =>
          this.firestore.getChannels(userId).pipe(
            tap((channels) => {
              this.channels = channels;
              if (channels.length > 0) {
                this.onSelectChat(channels[0].id, ChatType.Channel);
              }
            }),
            switchMap(() => this.firestore.getChats(userId)),
            tap((chats) => {
              this.chats = chats;
            })
          )
        )
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  onSelectChat(chatId: string, chatType: ChatType, chatPartner?: ChatPartner) {
    this.chatService.selectChatId(chatId);
    this.chatService.selectChatType(chatType);
    
    if (chatPartner) {
      this.chatService.selectChatPartner(chatPartner);
    }
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
