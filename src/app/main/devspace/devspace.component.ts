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
    private channel: ChannelService,
  ) {}

  ngOnInit() {
    this.firestore.getChannels(this.userId).subscribe((channels) => {
      this.channels = channels;
    });

    this.firestore.getChats(this.userId).subscribe((chats) => {
      this.chats = chats;
    });
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  onSelectChannel(id: string) {
    this.channel.setChannelId(id);
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
