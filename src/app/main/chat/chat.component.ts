import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { MessageService } from './../../shared/services/message.service';
import { EmojiService } from '../../shared/services/emoji.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import {
  OverlayMenuType,
  OverlayService,
} from '../../shared/services/overlay.service';
import { User, Message } from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChatService } from '../../shared/services/chat.service';
import { ChatType } from '../../shared/models/chat.enums';
import { subscribe } from 'diagnostics_channel';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    SingleMessageComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmojiMenuComponent,
    HoverOutsideDirective,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  currentChatType: ChatType = ChatType.Channel;
  currentChatId: string = '';
  chatName: string = '';
  channelMembers: User[] = [];

  // TODO: avoid any type
  currentChat: any;
  chatMessages: Message[] = [];

  messages = [
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
  ];
  messages$ = this.messageService.messages$;
  inputText: string = '';
  members: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private overlayService: OverlayService,
    public emojiService: EmojiService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // TODO: Optimize the ngOnInit method and set the ID of the first channel as currentChatId during initialization (as in devspace.component).
  ngOnInit() {
    this.chatService.selectedChatId$
      .pipe(
        filter((chatId) => !!chatId), // Nur wenn chatId nicht leer ist!
        tap((chatId) => {
          this.currentChatId = chatId;
          console.log('Chat ID in Chat Component: ', this.currentChatId);
        })
      )
      .subscribe((chatId) => {
        this.firestore
          .getChat(this.currentChatType, chatId)
          .subscribe((chat) => {
            this.currentChat = chat;
          });
        if (this.currentChatType === ChatType.Channel) {
          this.firestore
            .getChannelMembers(chatId, this.currentChatType)
            .subscribe((members) => {
              this.channelMembers = members;
              this.members = this.channelMembers.length;
            });
        }
        this.firestore
          .getChatMessages(this.currentChatType, chatId)
          .subscribe((messages) => {
            this.chatMessages = Array.isArray(messages) ? messages : [messages];
            console.log(this.chatMessages);
          });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
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
      this.messages.push(msg);
      // this.messageService.addMessage(msg);
      this.inputText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
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
    this.emojiService.toggleChannelPicker();
  }

  openOverlay(overlay: OverlayMenuType) {
    this.overlayService.open(overlay);
  }
}
