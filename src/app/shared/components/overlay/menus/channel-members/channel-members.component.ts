import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../../services/overlay.service';
import { User } from '../../../../models/database.model';
import { FirestoreService } from '../../../../services/firestore.service';
import { ChatService } from '../../../../services/chat.service';
import { ChatType } from '../../../../models/chat.enums';

@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss',
})
export class ChannelMembersComponent {
  channelId: string = '';

  channelMembers: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    this.chatService.selectedChatId$.subscribe((chatId) => {
      if (chatId) {
        this.firestore
          .getChannelMembers(chatId, ChatType.Channel)
          .subscribe((members) => {
            this.channelMembers = members;
          });
      }
    })
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
