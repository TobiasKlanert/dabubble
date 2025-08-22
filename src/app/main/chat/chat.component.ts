import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, filter, of, switchMap, takeUntil, tap } from 'rxjs';
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

  currentChat: any;
  chatMessages: Message[] = [];

  inputText: string = '';
  members: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private overlayService: OverlayService,
    public emojiService: EmojiService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    combineLatest([
      this.chatService.selectedChatId$.pipe(filter((chatId) => !!chatId)),
      this.chatService.selectedChatType$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([chatId, chatType]) => {
          this.currentChatId = chatId;
          this.currentChatType = chatType;
        }),
        switchMap(([chatId, chatType]) =>
          this.firestore.getChat(chatType, chatId).pipe(
            tap((chat) => {
                this.currentChat = chat;
            }),
            switchMap(() => {
              if (chatType === ChatType.Channel) {
                return this.firestore
                  .getChannelMembers(chatId, chatType)
                  .pipe(
                    tap((members) => {
                      this.channelMembers = members;
                      this.members = members.length;
                    }),
                    switchMap(() =>
                      this.firestore.getChatMessages(chatType, chatId)
                    )
                  );
              } else {
                return this.firestore.getChatMessages(chatType, chatId);
              }
            })
          )
        )
      )
      .subscribe((messages) => {
        this.chatMessages = Array.isArray(messages) ? messages : [messages];
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  // TODO: Revise sendMessage method -> Synchronization with Firebase
  sendMessage() {
    if (this.inputText.trim()) {
      const msg = {
        text: this.inputText.trim(),
        outgoing: true,
        createdAt: new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      console.log(msg);
      /* this.messages.push(msg); */
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
