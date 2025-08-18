import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../shared/services/overlay.service';
import {
  UserChatPreview,
  Channel,
  User,
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChatService } from '../../shared/services/chat.service';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  userId: string = 'u1';

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
    this.firestore.getChannels(this.userId).subscribe((channels) => {
      this.channels = channels;
      if (this.channels.length > 0) {
        this.chatService.selectChat(this.channels[0]);
      }
    });

    this.firestore.getChats(this.userId).subscribe((chats) => {
      this.chats = chats;
    });
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  // TODO: avoid any type
  onSelectChat(chat: any) {
    this.chatService.selectChat(chat);
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
