import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { filter, Subject, takeUntil, switchMap } from 'rxjs';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { OverlayService } from '../shared/services/overlay.service';
import { UploadService } from '../shared/services/upload.service';
import { OverlayComponent } from '../shared/components/overlay/overlay.component';
import { User, Channel, Message } from '../shared/models/database.model';
import { SearchType } from '../shared/models/chat.enums';
import { FirestoreService } from '../shared/services/firestore.service';
import { SearchService } from '../shared/services/search.service';
import { ClickOutsideDirective } from '../shared/directives/click-outside.directive';
import { ToggleService } from '../shared/services/toggle.service';
import { SearchMenuComponent } from '../shared/components/search-menu/search-menu.component';
export type MainView = 'workspace' | 'chat' | 'thread';

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
  user!: User;
  searchResults: any[] = [];
  firstChannelId: string = '';
  isWorkspaceHidden: boolean = false;
  isThreadsHidden: boolean = true;
  isSearchMenuHidden: boolean = false;

  searchControl = new FormControl('');

  currentView: MainView = 'workspace';

  private destroy$ = new Subject<void>();
  private isOnlineSet = false;
  public currentSearchType!: SearchType;

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

  openProfileMenu() {
    this.overlayService.open('profileMenu');
  }

  toggleWorkspaceMenu() {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }

  showWorkspace() {
    this.currentView = 'workspace';
  }

  showChat() {
    this.currentView = 'chat';
  }

  showThread() {
    this.currentView = 'thread';
  }
}
