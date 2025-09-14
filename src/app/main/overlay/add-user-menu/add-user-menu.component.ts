import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSelectComponent } from '../../user-select/user-select.component';
import { OverlayService } from '../../../shared/services/overlay.service';
import { takeUntil, Subject } from 'rxjs';
import { SearchService } from '../../../shared/services/search.service';
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
  isInputEmpty: boolean = true;
  searchResults: User[] = [];

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  constructor(
    private overlayService: OverlayService,
    private searchService: SearchService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleButton(value: string) {
    this.isInputEmpty = value.trim().length === 0;
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

  // TODO: implement method to add users to a channel
  addUser(value?: string) {
    console.log('Added User: ', value);
    this.closeOverlay();
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
