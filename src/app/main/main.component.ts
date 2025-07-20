import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { UploadService } from '../services/upload.service';
import { OverlayService } from '../services/overlay.service';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel.model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, ChatComponent, ThreadsComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  overlayOpen: boolean = true;
  showFirstMenu: boolean = true;
  isInputEmpty: boolean = true;
  isFormInvalid: boolean = true;
  isInputUserInvisible: boolean = true;
  selectedOption?: string;

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService,
    private channelService: ChannelService
  ) {
    this.overlayService.overlayOpen$.subscribe((open) => {
      this.overlayOpen = open;
    });
  }

  closeOverlay() {
    this.overlayService.close();
    this.isInputEmpty = true;
    this.isFormInvalid = true;
    this.showFirstMenu = true;
  }

  onSearch(value: any, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log('Search event:', value);
    if (inputRef) {
      inputRef.value = '';
    }
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

  createChannel(name: string, description?: string) {
    const newChannel: Channel = { name, description };
    this.channelService.addChannel(newChannel);
  }
}
