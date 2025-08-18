import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Channel, DirectChat } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  channel: Channel | null = null;
  dm: DirectChat | null = null;

  // TODO: avoid any type
  private selectedChatSource = new BehaviorSubject<any>(null);
  selectedChat$ = this.selectedChatSource.asObservable();

  constructor() {}

  selectChat(chat: any) {
    this.selectedChatSource.next(chat);
  }
}
