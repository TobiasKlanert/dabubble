import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { User } from '../../../shared/models/database.model';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { ChatService } from '../../../shared/services/chat.service';

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
    this.chatService.selectedChat$.subscribe((chat) => {
      if (chat.id) {
        this.firestore
          .getChannelMembers(chat.id)
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
