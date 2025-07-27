import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from './../models/message.model';

@Injectable({
  providedIn: 'root'
})

export class MessageService {
  private messages: Message[] = [];
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.messagesSubject.asObservable();

  addMessage(message: Message) {
    this.messages.push(message);
    this.messagesSubject.next(this.messages);
  }
}