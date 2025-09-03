import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, Subject } from 'rxjs';
import { SearchMenuComponent } from '../search-menu/search-menu.component';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { SearchService } from '../../../shared/services/search.service';
import { User } from '../../../shared/models/database.model';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

@Component({
  selector: 'app-add-channel-menu',
  standalone: true,
  imports: [CommonModule, SearchMenuComponent, ClickOutsideDirective],
  templateUrl: './add-channel-menu.component.html',
  styleUrl: './add-channel-menu.component.scss',
})
export class AddChannelMenuComponent {
  userId: string = '';

  showFirstMenu: boolean = true;
  isInputEmpty: boolean = true;
  isFormInvalid: boolean = true;
  isInputUserInvisible: boolean = true;
  searchResults: User[] = [];

  selectedOption: string = 'none';

  private destroy$ = new Subject<void>();

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private searchService: SearchService,
    public textareaResizeService: TextareaResizeService
  ) {}

  ngOnInit() {
    this.setUserId();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setUserId() {
    this.userId = this.firestore.loggedInUserId;
  }

  toggleMenus() {
    this.showFirstMenu = !this.showFirstMenu;
  }

  onRadioClick(option: string, event: Event) {
    if (this.selectedOption === option) {
      event.preventDefault();
    } else {
      this.selectedOption = option;
      switch (option) {
        case 'addAll':
          this.isInputUserInvisible = true;
          break;
        case 'addUser':
          this.isInputUserInvisible = false;
          break;
        default:
          break;
      }
    }
  }

  toggleButton(event: Event, value: string) {
    const el = event.target as HTMLElement;
    switch (el.id) {
      case 'inputChannelName':
        this.isInputEmpty = value.trim().length === 0;
        break;
      case 'radioUsersAddAll':
        this.isFormInvalid = false;
        break;
      case 'radioUsersAddUser':
        this.isFormInvalid = value.trim().length === 0;
        break;
      case 'inputAddUser':
        this.isFormInvalid = value.trim().length === 0;
        break;
      default:
        break;
    }
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

  // TODO: implement method for inserting members
  createChannel(inputName: string, inputDescription: string) {
    this.firestore
      .createChannel({
        name: inputName,
        description: inputDescription,
        creatorId: this.userId,
        members: [this.userId, 'u2', 'u3'],
      })
      .then(() => {
        this.closeOverlay();
      });
  }

  closeOverlay() {
    this.overlayService.close();
    this.isInputEmpty = true;
    this.isFormInvalid = true;
    this.showFirstMenu = true;
  }
}
