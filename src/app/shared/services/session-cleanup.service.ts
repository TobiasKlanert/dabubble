import { Injectable } from '@angular/core';
import { ChatService } from './chat.service';
import { FirestoreService } from './firestore.service';
import { SearchService } from './search.service';
import { OverlayService } from './overlay.service';
import { ToggleService } from './toggle.service';

@Injectable({
  providedIn: 'root',
})
export class SessionCleanupService {
  constructor(
    private chatService: ChatService,
    private firestoreService: FirestoreService,
    private searchService: SearchService,
    private overlayService: OverlayService,
    private toggleService: ToggleService
  ) {}

  cleanupSession() {
    this.chatService.resetState();
    this.firestoreService.resetSessionState();
    this.searchService.resetState();
    this.overlayService.resetState();
    this.toggleService.resetState();

    if (typeof window !== 'undefined') {
      window.sessionStorage?.clear();
    }
  }
}
