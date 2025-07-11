import { Component } from '@angular/core';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [DevspaceComponent, ChatComponent, ThreadsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
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
