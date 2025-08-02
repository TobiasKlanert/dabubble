import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../shared/services/overlay.service';
import { UserChatPreview, Channel } from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  channelsOpen = true;
  messagesOpen = true;

  channels: Channel[] = [];
  chats: UserChatPreview[] = []

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    const userId = 'u1';

    this.firestore.getChannels(userId).subscribe((channels) => {
      this.channels = channels;
    })

    this.firestore.getChats(userId).subscribe((chats) => {
      this.chats = chats;
    });
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
