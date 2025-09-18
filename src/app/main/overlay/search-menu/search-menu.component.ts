import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/database.model';
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
  @Input() searchResults: User[] = [];
  @Input() searchType!: SearchType;

  loggedInUserId: string = '';
  selectedUsers: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.firestore.loggedInUserId$.subscribe((id) => {
      this.loggedInUserId = id;
    })
  }

  clickOnUser(id: string) {
    switch (this.searchType) {
      case SearchType.ShowProfile:
        this.firestore.setSelectedUserId(id);
        this.overlayService.open('profile');
        break;
      case SearchType.AddUser:
        const userToAdd = this.searchResults.find((user) => user.id === id);
        if (userToAdd && !this.selectedUsers.some((u) => u.id === id)) {
          this.selectedUsers.push(userToAdd);
        }
        break;
      case SearchType.NewChat:
        const user = this.searchResults.find(user => user.id === id);
        
        if (user) {
          this.firestore.getOrCreateDirectChatId(this.loggedInUserId, user.id)
            .then(chatId => {
              this.chatService.selectChatId(chatId);
              this.chatService.selectChatPartner(user);
              this.chatService.selectChatType(ChatType.DirectMessage);
            });
        }
        break;
      case SearchType.MentionUser:
        break;
    }
  }
}
