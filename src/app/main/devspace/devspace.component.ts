import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, switchMap, tap, takeUntil, filter } from 'rxjs';
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
  loggedInUser!: User;

  channelsOpen: boolean = true;
  messagesOpen: boolean = true;
  inputFocused: boolean = false;

  channels: Channel[] = [];
  chats: UserChatPreview[] = [];
  members: User[] = [];

  searchResults: any[] = [];
  isSearchMenuHidden: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        filter((id): id is string => !!id),
        takeUntil(this.destroy$),
        tap((userId) => (this.userId = userId)),
        switchMap((userId) =>
          this.firestore.getUser(userId).pipe(
            tap((user) => (this.loggedInUser = user)),
            switchMap((user) =>
              this.firestore.getChannels(user.id).pipe(
                tap((channels) => {
                  this.channels = channels;
                  if (channels.length > 0) {
                    this.chatService.selectChatId(channels[0].id);
                    this.chatService.selectChatType(ChatType.Channel);
                  }
                }),
                switchMap(() => this.firestore.getChats(user.id)),
                tap((chats) => (this.chats = chats))
              )
            )
          )
        )
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
