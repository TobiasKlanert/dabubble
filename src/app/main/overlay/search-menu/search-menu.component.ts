import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/database.model';
import { SearchType } from '../../../shared/models/chat.enums';
import { OverlayService } from '../../../shared/services/overlay.service';
import { FirestoreService } from '../../../shared/services/firestore.service';

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

  constructor(private overlayService: OverlayService, private firestore: FirestoreService) {}

  clickOnUser(id: string) {
    switch (this.searchType) {
      case SearchType.ShowProfile:
        this.firestore.setSelectedUserId(id);
        this.overlayService.open("profile");
        break;
    
      default:
        break;
    }
  }
}
