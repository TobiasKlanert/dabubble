import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../shared/services/overlay.service';
import {
  UserChatPreview,
  Channel,
  User,
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChannelService } from '../../shared/services/channel.service';
import { ChatService } from '../../shared/services/chat.service';
import { DmService } from '../../shared/services/dm.service';
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
    private channelService: ChannelService,
    private chatService: ChatService,
    private dmService: DmService
  ) {}

  ngOnInit() {
    this.channelService.channels$.subscribe((channels) => {
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
    this.channelService.setChannelId(channelId);
    this.chatService.openChatWindow(ChatType.Channel);
  }

  openDM(dmId: string) {
    this.chatService.openChatWindow(ChatType.DirectMessage);
    this.dmService.setDirectMessageId(dmId);
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
