import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/channel.model';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private channels: Channel[] = [];
  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  addChannel(channel: Channel) {
    this.channels.push(channel);
    this.channelsSubject.next([...this.channels]);
  }

  getChannels(): Channel[] {
    return [...this.channels];
  }
}
