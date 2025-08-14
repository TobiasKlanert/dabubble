import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatType } from '../models/chat.enums';
import { Channel, DirectChat } from '../models/database.model';
import { FirestoreService } from './firestore.service';
import { GlobalIdService } from './global-id.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  channel: Channel | null = null;
  dm: DirectChat | null = null;
  private dmSubscription?: Subscription;
  private channelSubscription?: Subscription;

  constructor(
    private firestore: FirestoreService,
    private globalIdService: GlobalIdService
  ) {}

  openChatWindow(type: ChatType) {
    if (type === ChatType.DirectMessage) {
      let dmId = this.globalIdService.getCurrentDirectMessageId();

      if (this.dmSubscription) {
        this.dmSubscription.unsubscribe();
      }

      this.dmSubscription = this.firestore.getChat(dmId).subscribe((dm) => {
        this.dm = dm;
        console.log('DM: ', this.dm);
      });
    } else if (type === ChatType.Channel) {
      let channelId = this.globalIdService.getCurrentChannelId();

      if (this.channelSubscription) {
        this.channelSubscription.unsubscribe();
      }

      this.channelSubscription = this.firestore
        .getChannel(channelId)
        .subscribe((channel) => {
          this.channel = channel;
          console.log('Channel: ', this.channel);
        });
    }
  }
}
