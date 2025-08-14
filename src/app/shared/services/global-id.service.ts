import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalIdService {
  constructor() {}

  private selectedDirectMessageId = new BehaviorSubject<string>('');
  selectedDirectMessageId$ = this.selectedDirectMessageId.asObservable();

  private selectedChannelId = new BehaviorSubject<string>('');
  selectedChannelId$ = this.selectedChannelId.asObservable();

  private channels = new BehaviorSubject<Channel[]>([]);
  channels$ = this.channels.asObservable();

  setDirectMessageId(id: string) {
    this.selectedDirectMessageId.next(id);
  }

  getCurrentDirectMessageId(): string {
    return this.selectedDirectMessageId.getValue();
  }

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
