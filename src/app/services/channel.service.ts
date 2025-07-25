import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/channel.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private channels: Channel[] = [
    {
      id: '1',
      name: 'Entwicklerteam',
      description: '',
    },
    {
      id: '2',
      name: 'Office-Team',
      description: '',
    },
  ];
  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channelsSubject.asObservable();

  constructor() {
    this.channelsSubject.next(this.channels);
  }

  addChannel(channel: Channel) {
    this.channels.push(channel);
    this.channelsSubject.next([...this.channels]);
  }

  createChannel(name: string, description?: string) {
    const newChannel: Channel = {
      id: uuidv4(),
      name,
      description,
    };
    this.addChannel(newChannel);
  }

  getChannels(): Channel[] {
    return [...this.channels];
  }
}
