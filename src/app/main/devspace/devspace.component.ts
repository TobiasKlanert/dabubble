import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../shared/services/overlay.service';
import {
  UserChatPreview,
  Channel,
  User,
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { GlobalIdService } from '../../shared/services/global-id.service';
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
  userId: string = 'u1';

  channelsOpen: boolean = true;
  messagesOpen: boolean = true;

  channels: Channel[] = [];
  chats: UserChatPreview[] = [];
  members: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private globalIdService: GlobalIdService,
    private chatService: ChatService,
  ) {}

  ngOnInit() {
    this.globalIdService.channels$.subscribe((channels) => {
      this.channels = channels;
    });

    this.firestore.getChats(this.userId).subscribe((chats) => {
      this.chats = chats;
    });
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  onSelectChannel(channelId: string) {
    this.globalIdService.setChannelId(channelId);
    this.chatService.openChatWindow(ChatType.Channel);
  }

  openDM(dmId: string) {
    this.globalIdService.setDirectMessageId(dmId);
    this.chatService.openChatWindow(ChatType.DirectMessage);
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
