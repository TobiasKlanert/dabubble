import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { OverlayService } from '../shared/services/overlay.service';
import { UploadService } from '../shared/services/upload.service';
import { OverlayComponent } from './overlay/overlay.component';
import { User } from '../shared/models/database.model';
import { FirestoreService } from '../shared/services/firestore.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    DevspaceComponent,
    ChatComponent,
    ThreadsComponent,
    OverlayComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  userId: string = 'u1';
  user!: User;
  firstChannelId: string = '';
  isWorkspaceHidden: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$
      .pipe(
        switchMap((currentUserId) => this.firestore.getUser(currentUserId)),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TODO: Complete search function
  onSearch(value: any, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log('Search event:', value);
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
