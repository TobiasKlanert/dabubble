import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  filter,
  Subject,
  takeUntil,
  switchMap,
} from 'rxjs';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { OverlayService } from '../shared/services/overlay.service';
import { UploadService } from '../shared/services/upload.service';
import { OverlayComponent } from './overlay/overlay.component';
import { User } from '../shared/models/database.model';
import { FirestoreService } from '../shared/services/firestore.service';
import { SearchService } from '../shared/services/search.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    DevspaceComponent,
    ChatComponent,
    ThreadsComponent,
    OverlayComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  userId: string = 'u1';
  user!: User;
  searchResults: User[] = [];
  firstChannelId: string = '';
  isWorkspaceHidden: boolean = false;

  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        filter((id): id is string => !!id), // nur wenn id truthy ist (kein '', null, undefined)
        switchMap((currentUserId) => this.firestore.getUser(currentUserId)),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.user = user;
        this.firestore.setOnlineStatus(user.id, true);
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
      .searchUsers(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.searchResults = users;
        console.log(this.searchResults);
      });

    if (inputRef) {
      inputRef.value = '';
    }
  }

  openProfileMenu() {
    this.overlayService.open('profileMenu');
  }

  toggleWorkspaceMenu() {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }
}
