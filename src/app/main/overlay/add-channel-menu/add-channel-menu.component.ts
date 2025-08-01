import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../shared/services/channel.service';
import { Channel } from '../../../shared/models/channel.model';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';

@Component({
  selector: 'app-add-channel-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-channel-menu.component.html',
  styleUrl: './add-channel-menu.component.scss',
})
export class AddChannelMenuComponent {
  showFirstMenu: boolean = true;
  isInputEmpty: boolean = true;
  isFormInvalid: boolean = true;
  isInputUserInvisible: boolean = true;
  selectedOption: string = 'none';

  constructor(
    public channelService: ChannelService,
    private overlayService: OverlayService,
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

  closeOverlay() {
    this.overlayService.close();
    this.isInputEmpty = true;
    this.isFormInvalid = true;
    this.showFirstMenu = true;
  }
}
