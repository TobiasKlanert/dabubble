import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filter, Subject, takeUntil, switchMap } from 'rxjs';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { SearchMenuComponent } from './overlay/search-menu/search-menu.component';
import { OverlayService } from '../shared/services/overlay.service';
import { UploadService } from '../shared/services/upload.service';
import { OverlayComponent } from './overlay/overlay.component';
import { User, Channel } from '../shared/models/database.model';
import { SearchType } from '../shared/models/chat.enums';
import { FirestoreService } from '../shared/services/firestore.service';
import { SearchService } from '../shared/services/search.service';
import { ClickOutsideDirective } from '../shared/directives/click-outside.directive';
import { ToggleService } from '../shared/services/toggle.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    DevspaceComponent,
    ChatComponent,
    ThreadsComponent,
    SearchMenuComponent,
    OverlayComponent,
    ReactiveFormsModule,
    ClickOutsideDirective,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  userId: string = 'u1';
  user!: User;
  searchResults: (User | Channel)[] = [];
  firstChannelId: string = '';
  isWorkspaceHidden: boolean = false;
  isThreadsHidden: boolean = true;
  isSearchMenuHidden: boolean = false;

  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();
  private isOnlineSet = false;
  public searchType = SearchType;

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private searchService: SearchService,
    private toggleService: ToggleService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        filter((id): id is string => !!id),
        switchMap((currentUserId) => this.firestore.getUserLive(currentUserId)),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.user = user;

        if (!this.isOnlineSet) {
          this.firestore.setOnlineStatus(user.id, true);
          this.isOnlineSet = true;
        }
      });
    this.toggleService.state$.subscribe((val) => {
      this.isThreadsHidden = val;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.searchResults = [];
    this.isSearchMenuHidden = false;

    // Suche nach letztem @ oder #
    const atIndex = value.lastIndexOf('@');
    const hashIndex = value.lastIndexOf('#');

    // Prüfe, welches Zeichen zuletzt vorkommt
    let trigger = '';
    let triggerIndex = -1;
    if (atIndex > hashIndex) {
      trigger = '@';
      triggerIndex = atIndex;
    } else if (hashIndex > atIndex) {
      trigger = '#';
      triggerIndex = hashIndex;
    }

    // Wenn kein Trigger vorhanden oder nicht am Wortanfang, keine Suche
    if (triggerIndex === -1) return;
    // Prüfe, ob vor dem Trigger ein Leerzeichen oder Zeilenanfang ist
    if (triggerIndex > 0 && !/\s/.test(value[triggerIndex - 1])) return;

    // Hole den Suchbegriff nach dem Trigger
    const query = value.substring(triggerIndex + 1).trim();

    if (trigger === '#') {
      this.searchChannel(query);
    }

    if (trigger === '@') {
      this.searchMembers(query);
    }

    if (inputRef) {
      inputRef.value = '';
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
    this.searchService
      .searchUsersAndChannels(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.searchResults = users;
      });
    return;
  }

  onSearchMenuHidden(hidden: boolean, inputRef: HTMLInputElement) {
    this.isSearchMenuHidden = hidden;
    inputRef.value = '';
  }

  openProfileMenu() {
    this.overlayService.open('profileMenu');
  }

  toggleWorkspaceMenu() {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }
}
