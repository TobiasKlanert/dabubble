import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Channel, ChatPartner } from '../../../shared/models/database.model';
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
  @Input() searchResults: (User | Channel | ChatPartner)[] = [];
  @Input() searchType!: SearchType;

  loggedInUserId: string = '';
  selectedUsers: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private chatService: ChatService
  ) {}

  // TODO: Implement searh for @ and # (on @ all users are shown, on # all channels are shown)
  ngOnInit() {
    this.firestore.loggedInUserId$.subscribe((id) => {
      this.loggedInUserId = id;
    });
  }

  // TODO: Implement method to mention a user in a chat messsage
  clickOnUser(id: string) {
    switch (this.searchType) {
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
        break;
    }
  }

  // TODO: Implement method to mention a channel in a chat message
  clickOnChannel(id: string) {
    if (
      this.searchType === SearchType.NewChat ||
      this.searchType === SearchType.ShowProfile
    ) {
      this.chatService.selectChatId(id);
      this.chatService.selectChatType(ChatType.Channel);
    }
  }

  isUser(obj: any): obj is User | ChatPartner {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    // ChatPartner hat kein email, User schon, aber beide haben onlineStatus und profilePictureUrl
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
}
