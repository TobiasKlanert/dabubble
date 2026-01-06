import {
  Component,
  ElementRef,
  Output,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  combineLatest,
  filter,
  switchMap,
  takeUntil,
  tap,
  of,
} from 'rxjs';
import { EmojiService } from '../../shared/services/emoji.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SearchMenuComponent } from '../../shared/components/search-menu/search-menu.component';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import {
  OverlayMenuType,
  OverlayService,
} from '../../shared/services/overlay.service';
import {
  User,
  Channel,
  Message,
  ChatPartner,
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { SearchService } from '../../shared/services/search.service';
import { ChatService } from '../../shared/services/chat.service';
import { ChatType, SearchType } from '../../shared/models/chat.enums';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { SingleMessageComponent } from '../../shared/components/single-message/single-message.component';
import { EmojiMenuComponent } from '../../shared/components/emoji-menu/emoji-menu.component';

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
    ClickOutsideDirective,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  @Output() threadSelected = new EventEmitter<void>()

  currentChatType: ChatType = ChatType.Channel;
  currentChatId: string = '';
  currentQuery: string = '';
  currentUserId: string = '';
  chatName: string = '';
  chatToken: string = '';
  channelMembers: User[] = [];

  currentChat: any;
  currentChatPartner?: any;
  chatMessages: Message[] = [];

  inputText: string = '';
  members: number = 0;

  currentSearchType: SearchType = SearchType.AddUser;
  searchResults: (User | Channel | ChatPartner)[] = [];
  isSearchMenuHidden: boolean = false;
  areMessagesLoaded: boolean = false;
  trigger: string = '@';

  private destroy$ = new Subject<void>();
  public chatType = ChatType;
  public searchType = SearchType;

  constructor(
    private overlayService: OverlayService,
    public emojiService: EmojiService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private searchService: SearchService
  ) {}

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputMessage') inputMessage!: ElementRef<HTMLTextAreaElement>;

  ngOnInit() {
    combineLatest([
      this.chatService.selectedChatId$.pipe(filter((chatId) => !!chatId)),
      this.chatService.selectedChatType$,
      this.chatService.selectedChatPartner$,
      this.firestore.loggedInUserId$
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([chatId, chatType, ChatPartner, userId]) => {
          this.currentChatId = chatId;
          this.currentChatType = chatType;
          this.currentUserId = userId;
        }),
        switchMap(([chatId, chatType, ChatPartner]) => {
          const partnerStream = 
            chatType === ChatType.DirectMessage && ChatPartner?.id
              ? this.firestore.getUserLive(ChatPartner.id).pipe(
                  tap(updatedPartner => {
                    this.currentChatPartner = updatedPartner;
                  })
                )
              : of(null).pipe(
                  tap(() => {
                    this.currentChatPartner = ChatPartner;
                  })
                );

          return combineLatest([
            partnerStream,
            this.firestore.getChat(chatType, chatId).pipe(
              tap((chat) => {
                this.currentChat = chat;
              })
            )
          ]);
        }),
        switchMap(() => {
          if (this.currentChatType === ChatType.Channel) {
            return this.firestore.getChannelMembers(this.currentChatId, this.currentChatType).pipe(
              tap((members) => {
                this.channelMembers = members;
                this.members = members.length;
              }),
              switchMap(() =>
                this.firestore.getChatMessages(this.currentChatType, this.currentChatId)
              )
            );
          } else if (this.currentChatType === ChatType.DirectMessage) {
            return this.firestore.getChatMessages(this.currentChatType, this.currentChatId);
          } else {
            return of([]);
          }
        })
      )
      .subscribe((messages) => {
        this.chatMessages = Array.isArray(messages) ? messages : [messages];
        setTimeout(() => {
          this.getChatName();
          this.scrollToBottom();
          this.inputMessage?.nativeElement.focus();
          this.areMessagesLoaded = true;
        }, 0);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getChatName() {
    if (this.currentChatType === ChatType.Channel) {
      if (!this.currentChat?.name) return;
      this.chatName = this.currentChat.name;
      this.chatToken = '#' + this.chatName;
    } else {
      if (!this.currentChatPartner?.name) return;
      this.chatName = this.currentChatPartner.name;
      this.chatToken = '@' + this.chatName;
    }
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
    }
  }

  onSearch(value: string, searchType: SearchType): void {
    this.currentSearchType = searchType;
    this.currentQuery = value;
    this.searchService
      .onSearch(
        value,
        searchType,
        this.currentChatType,
        this.channelMembers,
        this.currentChatPartner
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.searchResults = results;
        this.isSearchMenuHidden = false;
      });
  }

  onMention(mention: string) {
    const { newText, newCursor } = this.searchService.insertMention(
      this.inputText,
      mention,
      this.inputMessage.nativeElement.selectionStart
    );
    this.inputText = newText;

    setTimeout(() => {
      const textarea = this.inputMessage.nativeElement;
      textarea.selectionStart = textarea.selectionEnd = newCursor;
      textarea.focus();
      this.isSearchMenuHidden = true;
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 500);
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

  onThreadSelect() {
    this.threadSelected.emit();
  }
}
