import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../models/channel.model';
import { OverlayService } from '../../../services/overlay.service';

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
    private channelService: ChannelService,
    private overlayService: OverlayService
  ) {}

  toggleMenus() {
    this.showFirstMenu = !this.showFirstMenu;
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'; // Reset height
    const maxHeight = 90; // Max in px

    // Set new height up to the limit
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';

    // Optional: hide scroll but allow scrolling internally if over limit
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
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

  createChannel(name: string, description?: string) {
    const newChannel: Channel = { name, description };
    this.channelService.addChannel(newChannel);
  }

  closeOverlay() {
    this.overlayService.close();
    this.isInputEmpty = true;
    this.isFormInvalid = true;
    this.showFirstMenu = true;
  }
}
