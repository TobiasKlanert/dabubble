import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThreadService {
  private _activeChatId$ = new BehaviorSubject<string | null>(null);
  private _activeMessageId$ = new BehaviorSubject<string | null>(null);

  activeChatId$ = this._activeChatId$.asObservable();
  activeMessageId$ = this._activeMessageId$.asObservable();

  openThread(chatId: string, messageId: string) {
    this._activeChatId$.next(chatId);
    this._activeMessageId$.next(messageId);
  }

  closeThread() {
    this._activeChatId$.next(null);
    this._activeMessageId$.next(null);
  }
}
