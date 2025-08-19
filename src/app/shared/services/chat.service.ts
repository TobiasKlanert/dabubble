import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatType } from '../models/chat.enums';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private selectedChatId = new BehaviorSubject<string>('');
  selectedChatId$ = this.selectedChatId.asObservable();

  private selectedChatType = new BehaviorSubject<ChatType>(ChatType.Channel);
  selectedChatType$ = this.selectedChatType.asObservable();

  constructor() {}

  selectChatId(chatId: string) {
    this.selectedChatId.next(chatId);
  }

  selectChatType(ChatType: ChatType) {
    this.selectedChatType.next(ChatType);
  }

  getSelectedChatType() {
    return this.selectedChatType$;
  }
}
