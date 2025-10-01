import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of, take } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { User, ChatPartner } from '../../../shared/models/database.model';
import { ChatType, SearchType } from '../../../shared/models/chat.enums';
import { OverlayService } from '../../../shared/services/overlay.service';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { ChatService } from '../../../shared/services/chat.service';

@Component({
  selector: 'app-search-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-menu.component.html',
  styleUrl: './search-menu.component.scss',
})
export class SearchMenuComponent {
  @Input() searchResults: any[] = [];
  @Input() currentSearchType!: SearchType;

  @Output() elementSelected = new EventEmitter<string>();
  @Output() isSearchMenuHidden = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  loggedInUserId: string = '';
  selectedUsers: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.firestore.loggedInUserId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => (this.loggedInUserId = id));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['searchResults'] &&
      this.currentSearchType === SearchType.Keyword
    ) {
      const results = changes['searchResults'].currentValue as any[];
      if (results?.length) {
        this.attachSenderNames(results);
      } else {
        this.searchResults = [];
      }
    }
  }

  private attachSenderNames(results: any[]): void {
    const uniqueIds = Array.from(
      new Set(results.map((r) => r.senderId).filter(Boolean))
    );
    if (!uniqueIds.length) {
      results.forEach((r) => (r.sender = r.sender ?? null));
      return;
    }

    const observables = uniqueIds.map((id) =>
      this.firestore.getUser(id).pipe(
        map((user) => ({ id, name: user?.name ?? 'Unbekannt' })),
        catchError(() => of({ id, name: 'Unbekannt' }))
      )
    );

    forkJoin(observables)
      .pipe(takeUntil(this.destroy$))
      .subscribe((entries) => {
        const idToName = new Map(entries.map((e) => [e.id, e.name]));
        results.forEach(
          (r) => (r.sender = idToName.get(r.senderId) ?? 'Unbekannt')
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clickOnUser(id: string) {
    this.isSearchMenuHidden.emit(true);

    switch (this.currentSearchType) {
      case SearchType.ShowProfile:
        this.showUserProfile(id);
        break;
      case SearchType.AddUser:
        this.addUserToSearchMenu(id);
        break;
      case SearchType.NewChat:
        this.createNewChat(id);
        break;
      case SearchType.MentionUserOrChannel:
        this.selectUser(id);
        break;
    }
  }

  clickOnChannel(id: string) {
    this.isSearchMenuHidden.emit(true);
    if (
      this.currentSearchType === SearchType.NewChat ||
      this.currentSearchType === SearchType.ShowProfile
    ) {
      this.chatService.selectChatId(id);
      this.chatService.selectChatType(ChatType.Channel);
    } else if (this.currentSearchType === SearchType.MentionUserOrChannel) {
      this.selectChannel(id);
    }
  }

  clickOnMessage(id: string) {
    console.log(
      'Mit dieser Methode soll der Chat, in dem sich die angeklickte Nachricht befindet, geöffnet werden.',
      id
    );
    this.isSearchMenuHidden.emit(true);
  }

  isUser(obj: any): obj is User | ChatPartner {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.profilePictureUrl === 'string' &&
      typeof obj.onlineStatus !== 'undefined'
    );
  }

  showUserProfile(id: string) {
    this.firestore.setSelectedUserId(id);
    this.overlayService.open('profile');
  }

  addUserToSearchMenu(id: string) {
    const userToAdd = this.searchResults.find((user) => user.id === id);
    if (
      userToAdd &&
      !this.selectedUsers.some((u) => u.id === id) &&
      this.isUser(userToAdd)
    ) {
      this.selectedUsers.push(userToAdd as User);
    }
  }

  createNewChat(id: string) {
    const user = this.searchResults.find((user) => user.id === id);

    if (user && this.isUser(user)) {
      this.firestore
        .getOrCreateDirectChatId(this.loggedInUserId, user.id)
        .then((chatId) => {
          this.chatService.selectChatId(chatId);
          this.chatService.selectChatPartner(user);
          this.chatService.selectChatType(ChatType.DirectMessage);
        });
    }
  }

  selectUser(id: string) {
    this.firestore
      .getUser(id)
      .pipe(take(1))
      .subscribe((user) => {
        this.elementSelected.emit('@' + user.name);
      });
  }

  selectChannel(id: string) {
    this.firestore
      .getChannel(id)
      .pipe(take(1))
      .subscribe((channel) => {
        this.elementSelected.emit('#' + channel.name);
      });
  }
}
