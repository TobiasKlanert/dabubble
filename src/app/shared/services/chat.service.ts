import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatType } from '../models/chat.enums';
import { ChatPartner, ThreadMessage } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private selectedChatId = new BehaviorSubject<string>('');
  selectedChatId$ = this.selectedChatId.asObservable();

  private selectedChatType = new BehaviorSubject<ChatType>(ChatType.Channel);
  selectedChatType$ = this.selectedChatType.asObservable();

  private selectedChatPartner = new BehaviorSubject<ChatPartner>({
    id: '',
    name: '',
    profilePictureUrl: '',
    onlineStatus: false,
  });
  selectedChatPartner$ = this.selectedChatPartner.asObservable();

  private selectedThread = new BehaviorSubject<ThreadMessage[]>([]);
  selectedThread$ = this.selectedThread.asObservable();

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

  selectChatPartner(partner: ChatPartner) {
    this.selectedChatPartner.next(partner);
  }

  selectThread(thread: ThreadMessage[]) {
    this.selectedThread.next(thread);
  }
}
