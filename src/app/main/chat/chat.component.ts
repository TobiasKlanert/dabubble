import { Component, ElementRef, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  combineLatest,
  filter,
  switchMap,
  takeUntil,
  tap,
  of
} from 'rxjs';
import { EmojiService } from '../../shared/services/emoji.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { SearchMenuComponent } from '../overlay/search-menu/search-menu.component';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import {
  OverlayMenuType,
  OverlayService,
} from '../../shared/services/overlay.service';
import { User, Message, ChatPartner } from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { SearchService } from '../../shared/services/search.service';
import { ChatService } from '../../shared/services/chat.service';
import { ChatType, SearchType } from '../../shared/models/chat.enums';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    SingleMessageComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmojiMenuComponent,
    SearchMenuComponent,
    HoverOutsideDirective,
    ClickOutsideDirective
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
  currentChatPartner: ChatPartner = {
    id: '',
    name: '',
    profilePictureUrl: '',
    onlineStatus: false,
  };
  chatMessages: Message[] = [];

  inputText: string = '';
  members: number = 0;

  searchResults: User[] = [];

  private destroy$ = new Subject<void>();
  public chatType = ChatType;
  public searchType = SearchType;

  constructor(
    private overlayService: OverlayService,
    public emojiService: EmojiService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private searchService: SearchService
  ) { }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    combineLatest([
      this.chatService.selectedChatId$.pipe(filter((chatId) => !!chatId)),
      this.chatService.selectedChatType$,
      this.chatService.selectedChatPartner$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([chatId, chatType, ChatPartner]) => {
          this.currentChatId = chatId;
          this.currentChatType = chatType;
          this.currentChatPartner = ChatPartner;
        }),
        switchMap(([chatId, chatType]) =>
          this.firestore.getChat(chatType, chatId).pipe(
            tap((chat) => {
              this.currentChat = chat;
            }),
            switchMap(() => {
              if (chatType === ChatType.Channel) {
                return this.firestore.getChannelMembers(chatId, chatType).pipe(
                  tap((members) => {
                    this.channelMembers = members;
                    this.members = members.length;
                  }),
                  switchMap(() =>
                    this.firestore.getChatMessages(chatType, chatId)
                  )
                );
              } else if (chatType === ChatType.DirectMessage) {
                return this.firestore.getChatMessages(chatType, chatId);
              } else {
                return of([]);
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
      this.firestore.addMessage(this.currentChatType, this.currentChatId, msg);

      this.inputText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
  
  // TODO: implement method to start a new chat
  onSearch(value: string): void {
    const atIndex = value.lastIndexOf('@');

    if (atIndex !== -1) {
      const query = value.substring(atIndex + 1).trim(); // alles nach dem @
      if (query.length > 0) {
        this.searchService
          .searchUsers(query)
          .pipe(takeUntil(this.destroy$))
          .subscribe((users) => {
            this.searchResults = users;
            console.log(this.searchResults);
          });
      } else {
        this.searchResults = [];
      }
    } else {
      this.searchResults = [];
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

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }
}
