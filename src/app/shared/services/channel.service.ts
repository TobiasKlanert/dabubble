import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelId = new BehaviorSubject<string>('');
  selectedChannelId$ = this.selectedChannelId.asObservable();

  setChannelId(id: string) {
    this.selectedChannelId.next(id);
  }

  getCurrentChannelId(): string {
    return this.selectedChannelId.getValue();
  }
}
