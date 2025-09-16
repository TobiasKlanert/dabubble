import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectComponent } from '../../user-select/user-select.component';
import { OverlayService } from '../../../shared/services/overlay.service';
import { takeUntil, Subject } from 'rxjs';
import { SearchService } from '../../../shared/services/search.service';
import { ChatService } from '../../../shared/services/chat.service';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { User } from '../../../shared/models/database.model';
import { SearchType } from '../../../shared/models/chat.enums';

@Component({
  selector: 'app-add-user-menu',
  standalone: true,
  imports: [CommonModule, UserSelectComponent],
  templateUrl: './add-user-menu.component.html',
  styleUrl: './add-user-menu.component.scss',
})
export class AddUserMenuComponent {
  channelId: string = '';
  isFormInvalid: boolean = true;
  searchResults: User[] = [];

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  constructor(
    private overlayService: OverlayService,
    private searchService: SearchService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.searchService.selectedUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.searchResults = users;
        this.isFormInvalid = this.searchResults.length === 0;
      });

    this.chatService.selectedChatId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.channelId = id;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addUser() {
    const newMembers = [...this.searchResults.map((user) => user.id)];
    this.firestore.addMemberToChannel(this.channelId, newMembers);
    this.closeOverlay();
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
