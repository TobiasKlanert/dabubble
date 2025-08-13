import { Injectable } from '@angular/core';
import { ChatType } from '../models/chat.enums';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor() {}

  openChatWindow(type: ChatType) {
    if (type === ChatType.DirectMessage) {
      console.log('Öffne Direktnachricht');
    } else if (type === ChatType.Channel) {
      console.log('Öffne Channel');
    }
  }
}
