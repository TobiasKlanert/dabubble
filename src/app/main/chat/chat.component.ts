import {
  Component,
  ElementRef,
  Output,
  ViewChild,
  EventEmitter,
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
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { SearchMenuComponent } from '../overlay/search-menu/search-menu.component';
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
  currentChatType: ChatType = ChatType.Channel;
  currentChatId: string = '';
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
      this.chatName = this.currentChat.name;
      this.chatToken = '#' + this.chatName;
    } else {
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

  toggleTrigger(current: string): string {
    const old = current;
    this.trigger = current === '@' ? '#' : '@';
    return old;
  }

  openOverlay(overlay: OverlayMenuType) {
    this.overlayService.open(overlay);
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }
}
