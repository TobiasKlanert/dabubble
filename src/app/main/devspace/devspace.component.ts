import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Subject,
  switchMap,
  tap,
  takeUntil,
  filter,
  combineLatest,
  withLatestFrom,
} from 'rxjs';
import { OverlayService } from '../../shared/services/overlay.service';
import {
  UserChatPreview,
  Channel,
  User,
  ChatPartner,
} from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChatService } from '../../shared/services/chat.service';
import { ChatType, SearchType } from '../../shared/models/chat.enums';
import { SearchMenuComponent } from '../../shared/components/search-menu/search-menu.component';
import { SearchService } from '../../shared/services/search.service';
import { ScreenService } from '../../shared/services/screen.service';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [CommonModule, SearchMenuComponent],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  @Output() chatSelected = new EventEmitter<void>();

  public ChatType = ChatType;
  public currentSearchType!: SearchType;
  private destroy$ = new Subject<void>();

  userId: string = '';
  private lastUserId: string = '';
  loggedInUser!: User;

  channelsOpen: boolean = true;
  messagesOpen: boolean = true;
  inputFocused: boolean = false;
  isMobile!: boolean;

  channels: Channel[] = [];
  chats: UserChatPreview[] = [];
  members: User[] = [];

  searchResults: any[] = [];
  isSearchMenuHidden: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private searchService: SearchService,
    private screenService: ScreenService
  ) {}

  ngOnInit() {
    combineLatest([
      this.firestore.loggedInUserId$.pipe(filter((id): id is string => !!id)),
      this.screenService.isMobile$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([userId, isMobile]) => {
          if (this.lastUserId && this.lastUserId !== userId) {
            this.chatService.resetState();
          }
          this.lastUserId = userId;
          this.userId = userId;
          this.isMobile = isMobile;
          return this.firestore.getUserLive(userId);
        }),
        switchMap((user) => {
          this.loggedInUser = user;
          return combineLatest([
            this.firestore.getChannels(user.id),
            this.firestore.getChats(user.id),
          ]).pipe(
            withLatestFrom(
              this.chatService.selectedChatId$,
              this.chatService.selectedChatType$,
              this.chatService.selectedChatPartner$
            )
          );
        }),
        tap(
          ([
            [channels, chats],
            selectedChatId,
            selectedChatType,
            selectedChatPartner,
          ]) => {
          this.channels = channels;
          this.chats = chats;
          const channelMatch = selectedChatId
            ? channels.find((channel) => channel.id === selectedChatId)
            : undefined;
          const chatMatch = selectedChatId
            ? chats.find((chat) => chat.chatId === selectedChatId)
            : undefined;

          if (selectedChatId) {
            if (selectedChatType === ChatType.Channel) {
              if (channelMatch) {
                this.chatService.selectChatType(ChatType.Channel);
                return;
              }
              this.chatService.selectChatId('');
            } else if (selectedChatType === ChatType.DirectMessage) {
              if (chatMatch) {
                this.chatService.selectChatPartner(chatMatch.partner);
              } else if (selectedChatPartner?.id) {
                this.chatService.selectChatPartner(selectedChatPartner);
              }
              return;
            } else if (selectedChatType === ChatType.NewChat) {
              return;
            }
          }

          if (channelMatch) {
            this.chatService.selectChatType(ChatType.Channel);
            return;
          }

          if (chatMatch) {
            this.chatService.selectChatType(ChatType.DirectMessage);
            this.chatService.selectChatPartner(chatMatch.partner);
            return;
          }

          if (!selectedChatId) {
            if (channels.length > 0) {
              this.chatService.selectChatId(channels[0].id);
              this.chatService.selectChatType(ChatType.Channel);
            } else if (chats.length > 0) {
              this.chatService.selectChatId(chats[0].chatId);
              this.chatService.selectChatType(ChatType.DirectMessage);
              this.chatService.selectChatPartner(chats[0].partner);
            }
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  newChat() {
    this.chatService.selectChatType(ChatType.NewChat);
    this.chatSelected.emit();
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  onSelectChat(chatId: string, chatType: ChatType, chatPartner?: ChatPartner) {
    this.chatService.selectChatId(chatId);
    this.chatService.selectChatType(chatType);
    this.chatSelected.emit();

    if (chatPartner) {
      this.chatService.selectChatPartner(chatPartner);
    }
  }

  async onSelectSelfChat() {
    await this.firestore.getOrCreateSelfChat(this.userId).then(() => {
      const selfChatId = this.getSelfChatId();

      if (selfChatId) {
        this.onSelectChat(
          selfChatId,
          ChatType.DirectMessage,
          this.loggedInUser
        );
      }
    });
  }

  getSelfChatId(): string | null {
    const selfChat = this.chats.find((chat) => chat.partner.id === this.userId);

    return selfChat ? selfChat.chatId : null;
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }

  onSearch(value: string, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.searchService
      .onSearch(value, SearchType.Keyword)
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        this.searchResults = results;
        this.isSearchMenuHidden = false;

        if (this.searchResults.length > 0 && this.searchResults[0].text) {
          this.currentSearchType = SearchType.Keyword;
        } else {
          this.currentSearchType = SearchType.ShowProfile;
        }
      });

    if (inputRef) {
      inputRef.value = '';
    }
  }

  onSearchMenuHidden(hidden: boolean, inputRef: HTMLInputElement) {
    this.isSearchMenuHidden = hidden;
    inputRef.value = '';
  }
}
