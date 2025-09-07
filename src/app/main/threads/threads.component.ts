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

  constructor(public emojiService: EmojiService, private chatService: ChatService, private overlayService: OverlayService,) { }

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
    if (this.inputText.trim()) {
      const msg = {
        text: this.inputText.trim(),
        outgoing: true,
        timestamp: new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      console.log(msg);
      // this.messageService.addMessage(msg);
      this.inputText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
}
