import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { UploadService } from '../services/upload.service';
import { OverlayService } from '../services/overlay.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, ChatComponent, ThreadsComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  overlayOpen = true;
  isInputEmpty = true;

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService
  ) {
    this.overlayService.overlayOpen$.subscribe((open) => {
      this.overlayOpen = open;
    });
  }

  closeOverlay() {
    this.overlayService.close();
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

  toggleButton(value: string) {
    this.isInputEmpty = value.trim().length === 0;
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
}
