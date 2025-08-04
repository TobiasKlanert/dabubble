import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private selectedChannelId = new BehaviorSubject<string | null>(null);
  selectedChannelId$ = this.selectedChannelId.asObservable();

  setChannelId(id: string) {
    this.selectedChannelId.next(id);
  }

  getCurrentChannelId(): string | null {
    return this.selectedChannelId.getValue();
  }
}
