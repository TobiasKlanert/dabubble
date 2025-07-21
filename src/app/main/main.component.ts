import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { OverlayService } from '../services/overlay.service';
import { OverlayComponent } from './overlay/overlay.component';
import { UploadService } from '../services/upload.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    DevspaceComponent,
    ChatComponent,
    ThreadsComponent,
    OverlayComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService
  ) {}

  onSearch(value: any, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log('Search event:', value);
    if (inputRef) {
      inputRef.value = '';
    }
  }

  openProfileMenu() {
    this.overlayService.open('profile');
  }
}
