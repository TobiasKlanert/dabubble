import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { SearchMenuComponent } from '../overlay/search-menu/search-menu.component';
import { EmojiService } from '../../shared/services/emoji.service';
import {
  OverlayMenuType,
  OverlayService,
} from '../../shared/services/overlay.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import {
  User,
  Channel,
  ChatPartner,
  ThreadMessage,
} from '../../shared/models/database.model';
import { ChatType, SearchType } from '../../shared/models/chat.enums';
import { ChatService } from '../../shared/services/chat.service';
import { SearchService } from '../../shared/services/search.service';
import { ToggleService } from '../../shared/services/toggle.service';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-threads',
  standalone: true,
  imports: [
    EmojiMenuComponent,
    SingleMessageComponent,
    CommonModule,
    FormsModule,
    HoverOutsideDirective,
    SearchMenuComponent,
    ClickOutsideDirective
  ],
  templateUrl: './threads.component.html',
  styleUrl: './threads.component.scss',
})
export class ThreadsComponent {
  threadMessages: ThreadMessage[] = [];

  inputText: string = '';
  channelMembers: User[] = [];
  currentChatType: ChatType = ChatType.Channel;
  currentChatPartner: ChatPartner = {
    id: '',
    name: '',
    profilePictureUrl: '',
    onlineStatus: false,
  };
  currentSearchType: SearchType = SearchType.AddUser;
  searchResults: (User | Channel | ChatPartner)[] = [];
  isSearchMenuHidden: boolean = false;

  trigger: string = '@';

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  constructor(
    public emojiService: EmojiService,
    private chatService: ChatService,
    private overlayService: OverlayService,
    private toggleService: ToggleService,
    private firestore: FirestoreService,
    private searchService: SearchService
  ) {}

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('inputThread') inputThread!: ElementRef<HTMLTextAreaElement>;

  ngOnInit(): void {
    this.chatService.selectedThread$
      .pipe(takeUntil(this.destroy$))
      .subscribe((thread) => {
        this.threadMessages = thread; // Root-Message

        if (thread.length > 0) {
          const rootMessageId = thread[0].id!;

          this.chatService.selectedChatId$
            .pipe(takeUntil(this.destroy$))
            .subscribe((id) => {
              this.firestore
                .getChannelMembers(id, ChatType.Channel)
                .pipe(takeUntil(this.destroy$))
                .subscribe((members) => {
                  this.channelMembers = members;
                });

              this.firestore
                .getThread(id, rootMessageId)
                .pipe(takeUntil(this.destroy$))
                .subscribe((messages) => {
                  this.threadMessages = [thread[0], ...messages];
                  setTimeout(() => this.scrollToBottom(), 0);
                });
            });
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.chatService.selectedChatId$
        .subscribe((id) => (chatId = id))
        .unsubscribe();

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

  onSearch(value: string, searchType: SearchType): void {
    this.currentSearchType = searchType;
    this.searchResults = [];
    this.isSearchMenuHidden = false;

    const atIndex = value.lastIndexOf('@');
    const hashIndex = value.lastIndexOf('#');

    let trigger = '';
    let triggerIndex = -1;
    if (atIndex > hashIndex) {
      trigger = '@';
      triggerIndex = atIndex;
    } else if (hashIndex > atIndex) {
      trigger = '#';
      triggerIndex = hashIndex;
    }

    if (triggerIndex === -1) return;
    if (triggerIndex > 0 && !/\s/.test(value[triggerIndex - 1])) return;

    const query = value.substring(triggerIndex + 1).trim();

    if (trigger === '#') {
      this.searchChannel(query);
    }

    if (trigger === '@') {
      this.searchMembers(query);
    }
  }

  searchChannel(query: string) {
    this.firestore.loggedInUserId$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((userId) => this.firestore.getChannels(userId))
      )
      .subscribe((channels) => {
        if (query) {
          this.searchResults = channels.filter((channel) =>
            channel.name.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          this.searchResults = channels;
        }
      });
    return;
  }

  searchMembers(query: string) {
    if (this.currentChatType === ChatType.Channel) {
      const members = this.channelMembers || [];
      if (query) {
        this.searchResults = members.filter((member) =>
          member.name.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        this.searchResults = members;
      }
    } else if (this.currentChatType === ChatType.DirectMessage) {
      this.searchResults = [this.currentChatPartner];
    } else {
      this.searchService
        .searchUsers(query)
        .pipe(takeUntil(this.destroy$))
        .subscribe((users) => {
          this.searchResults = users;
        });
    }
    return;
  }

  insertMention(mention: string) {
    const textarea = this.inputThread.nativeElement;
    const cursor = textarea.selectionStart;

    // Suche das letzte @ oder #
    const triggerIndex = Math.max(
      this.inputText.lastIndexOf('@', cursor - 1),
      this.inputText.lastIndexOf('#', cursor - 1)
    );

    // Falls kein Trigger gefunden → normal einfügen
    if (triggerIndex === -1) {
      this.inputText =
        this.inputText.substring(0, cursor) +
        mention +
        ' ' +
        this.inputText.substring(cursor);
    } else {
      // Ersetze von Trigger bis Cursor mit der Mention
      const before = this.inputText.substring(0, triggerIndex);
      const after = this.inputText.substring(cursor);

      this.inputText = before + mention + ' ' + after;

      // Cursor neu setzen
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          before.length + mention.length + 1;
        textarea.focus();
        this.isSearchMenuHidden = true;
      });
    }
  }

  closeThreads() {
    this.toggleService.toggle();
  }

  toggleTrigger(current: string): string {
    const old = current;
    this.trigger = current === '@' ? '#' : '@';
    return old;
  }
}
