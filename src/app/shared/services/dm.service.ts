import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DmService {

  constructor() { }

  private selectedDirectMessageId = new BehaviorSubject<string>('');
    selectedDirectMessageId$ = this.selectedDirectMessageId.asObservable();
  
    setDirectMessageId(id: string) {
      this.selectedDirectMessageId.next(id);
    }
  
    getCurrentDirectMessageId(): string {
      return this.selectedDirectMessageId.getValue();
    }
}
