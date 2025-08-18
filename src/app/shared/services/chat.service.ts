import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatType } from '../models/chat.enums';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public ChatType = ChatType;

  // TODO: avoid any type
  private selectedChatSource = new BehaviorSubject<any>(null);
  selectedChat$ = this.selectedChatSource.asObservable();

  private selectedChatType = new BehaviorSubject<ChatType>(ChatType.Channel);
  selectedChatType$ = this.selectedChatType.asObservable();

  constructor() {}

  selectChat(chat: any) {
    this.selectedChatSource.next(chat);
  }

  selectChatType(ChatType: ChatType) {
    this.selectedChatType.next(ChatType);
  }

  getSelectedChatType() {
    return this.selectedChatType$;
  }
}
