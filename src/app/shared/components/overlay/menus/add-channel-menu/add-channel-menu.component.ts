import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { OverlayService } from '../../../../services/overlay.service';
import { TextareaResizeService } from '../../../../services/textarea-resize.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { SearchService } from '../../../../services/search.service';
import { ScreenService } from '../../../../services/screen.service';
import { User } from '../../../../models/database.model';
import { OverlayType, SearchType } from '../../../../models/chat.enums';
import { UserSelectComponent } from '../../../../components/user-select/user-select.component';

@Component({
  selector: 'app-add-channel-menu',
  standalone: true,
  imports: [CommonModule, UserSelectComponent],
  templateUrl: './add-channel-menu.component.html',
  styleUrl: './add-channel-menu.component.scss',
})
export class AddChannelMenuComponent {
  overlayType: OverlayType = OverlayType.Normal;
  OverlayType = OverlayType;

  userId: string = '';
  memberIds: string[] = [];
  showFirstMenu: boolean = true;
  isInputEmpty: boolean = true;
  isFormInvalid: boolean = true;
  isChannelNameAssigned: boolean = false;
  isErrorMessageVisible: boolean = false;
  isInputUserInvisible: boolean = true;
  searchResults: User[] = [];

  selectedOption: string = 'none';

  private destroy$ = new Subject<void>();
  public searchType = SearchType;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private searchService: SearchService,
    private screenService: ScreenService,
    public textareaResizeService: TextareaResizeService
  ) {}

ngOnInit() {
  this.setUserId();

  this.searchService.selectedUsers$
    .pipe(takeUntil(this.destroy$))
    .subscribe((users) => {
      this.searchResults = users;
      this.isFormInvalid = this.searchResults.length === 0;
    });

  this.screenService.isMobile$
    .pipe(takeUntil(this.destroy$))
    .subscribe((value) => {
      if (value) {
        this.overlayType = OverlayType.FullSize;
      } else {
        this.overlayType = OverlayType.Normal;
      }
    });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchService.setselectedUsers([]);
  }

  setUserId() {
    this.userId = this.firestore.loggedInUserId;
  }

  onRadioClick(option: string, event: Event) {
    if (this.selectedOption === option) {
      event.preventDefault();
    } else {
      this.selectedOption = option;
      switch (option) {
        case 'addAll':
          this.isInputUserInvisible = true;
          this.isFormInvalid = false;
          break;
        case 'addUser':
          this.isInputUserInvisible = false;
          this.isFormInvalid = true;
          break;
        default:
          break;
      }
    }
  }

  toggleButton(value: string) {
    this.isFormInvalid = value.trim().length === 0;
    this.isChannelNameAssigned = value.trim().length === 0;
  }

  toggleMenus() {
    this.isFormInvalid = true;
    this.showFirstMenu = !this.showFirstMenu;
  }

  async checkChannel(name: string) {
    try {
      const result = await this.firestore.channelExists(name);
      if (result.exists) {
        this.isFormInvalid = true;
        this.isChannelNameAssigned = true;
      } else {
        this.toggleMenus();
      }
    } catch (error) {
      this.isErrorMessageVisible = true;
    }
  }

  getMemberIds(): string[] {
    if (this.selectedOption === 'addUser') {
      this.memberIds = [
        this.userId,
        ...this.searchResults.map((user) => user.id),
      ];
    } else if (this.selectedOption === 'addAll') {
      this.memberIds = [this.userId, 'u1', 'u2', 'u3', 'u4', 'u5', 'u6'];
    }
    return this.memberIds;
  }

  createChannel(inputName: string, inputDescription: string) {
    const memberIds = this.getMemberIds();
    let newChannelData = {
      name: inputName,
      description: inputDescription,
      creatorId: this.userId,
      members: memberIds,
    };

    this.firestore.createChannel(newChannelData).then((result) => {
      if (result.exists) {
        this.isFormInvalid = true;
      } else {
        /* this.isFormInvalid = false; */
        this.closeOverlay();
      }
    });
  }

  closeOverlay() {
    this.overlayService.close();
    this.isInputEmpty = true;
    this.isFormInvalid = true;
    this.showFirstMenu = true;
  }
}
