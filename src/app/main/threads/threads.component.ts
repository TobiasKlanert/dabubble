import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EmojiMenuComponent } from '../../shared/components/emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../../shared/components/single-message/single-message.component';
import { SearchMenuComponent } from '../../shared/components/search-menu/search-menu.component';
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
    ClickOutsideDirective,
  ],
  templateUrl: './threads.component.html',
  styleUrl: './threads.component.scss',
})
export class ThreadsComponent {
  @Output() threadClosed = new EventEmitter<void>()

  threadMessages: ThreadMessage[] = [];

  inputText: string = '';
  channelMembers: User[] = [];
  currentChatType: ChatType = ChatType.Channel;
  currentChatPartner: any;
  currentSearchType: SearchType = SearchType.AddUser;
  searchResults: (User | Channel | ChatPartner)[] = [];
  isSearchMenuHidden: boolean = false;

  trigger: string = '@';

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  currentChatId: string = '';

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
    this.threadMessages = thread;

    if (thread.length > 0) {
      const rootMessageId = thread[0].id!;

      this.chatService.selectedChatId$
        .pipe(takeUntil(this.destroy$))
        .subscribe((id) => {
          this.currentChatId = id;

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
      this.inputThread.nativeElement.selectionStart
    );
    this.inputText = newText;

    setTimeout(() => {
      const textarea = this.inputThread.nativeElement;
      textarea.selectionStart = textarea.selectionEnd = newCursor;
      textarea.focus();
      this.isSearchMenuHidden = true;
    });
  }

  closeThreads() {
    this.toggleService.toggle();
    this.threadClosed.emit();
  }

  toggleTrigger(current: string): string {
    const old = current;
    this.trigger = current === '@' ? '#' : '@';
    return old;
  }
}
