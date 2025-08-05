import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelId = new BehaviorSubject<string>('');
  selectedChannelId$ = this.selectedChannelId.asObservable();

  private channels = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channels.asObservable();

  setChannelId(id: string) {
    this.selectedChannelId.next(id);
  }

  getCurrentChannelId(): string {
    return this.selectedChannelId.getValue();
  }

  setChannels(channels: Channel[]) {
    this.channels.next(channels);
  }
}
