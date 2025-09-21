import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { EmojiService } from '../../shared/services/emoji.service';
import {
  OverlayMenuType,
  OverlayService,
} from '../../shared/services/overlay.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import { ThreadMessage } from '../../shared/models/database.model';
import { ChatService } from '../../shared/services/chat.service';
import { ToggleService } from '../../shared/services/toggle.service';
import { FirestoreService } from '../../shared/services/firestore.service';

@Component({
  selector: 'app-threads',
  standalone: true,
  imports: [
    EmojiMenuComponent,
    SingleMessageComponent,
    CommonModule,
    FormsModule,
    HoverOutsideDirective,
  ],
  templateUrl: './threads.component.html',
  styleUrl: './threads.component.scss'
})
export class ThreadsComponent {

  threadMessages: ThreadMessage[] = [];

  inputText: string = '';

  constructor(
    public emojiService: EmojiService,
    private chatService: ChatService,
    private overlayService: OverlayService,
    private toggleService: ToggleService,
    private firestore: FirestoreService
  ) { }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.chatService.selectedThread$.subscribe((thread) => {
      this.threadMessages = thread;
    })
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {
      console.warn('Scroll to bottom failed:', err);
    }
  }

  addTextEmoji = (emoji: string) => {
    this.inputText += emoji;
  };

  toggleEmojiPicker() {
    this.emojiService.toggleThreadsPicker();
  }

  openOverlay(overlay: OverlayMenuType) {
    this.overlayService.open(overlay);
  }

  sendMessage() {
    if (this.inputText.trim() && this.threadMessages.length > 0) {
      // aktuelle Chat-ID aus dem ChatService holen
      let chatId = '';
      this.chatService.selectedChatId$.subscribe(id => chatId = id).unsubscribe();

      // Root-Message ID ist die erste Nachricht im Thread
      const rootMessageId = this.threadMessages[0].id!;

      const msg = {
        text: this.inputText.trim(),
        outgoing: true,
        createdAt: new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      this.firestore.addThreadMessage(chatId, rootMessageId, msg);

      this.inputText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }



  closeThreads() {
    this.toggleService.toggle()
  }
}
