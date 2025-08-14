import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';
import { FirestoreService } from '../../../shared/services/firestore.service';

@Component({
  selector: 'app-add-channel-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-channel-menu.component.html',
  styleUrl: './add-channel-menu.component.scss',
})
export class AddChannelMenuComponent {
  userId: string = 'u1';

  showFirstMenu: boolean = true;
  isInputEmpty: boolean = true;
  isFormInvalid: boolean = true;
  isInputUserInvisible: boolean = true;
  
  selectedOption: string = 'none';

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    public textareaResizeService: TextareaResizeService
  ) {}

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
