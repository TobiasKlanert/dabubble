import { Component } from '@angular/core';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { UploadService } from '../services/upload.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, ChatComponent, ThreadsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  constructor(public uploadService: UploadService) {}

  onSearch(value: any, inputRef?: HTMLInputElement, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log('Search event:', value);
    if (inputRef) {
      inputRef.value = '';
    }
  }
}
