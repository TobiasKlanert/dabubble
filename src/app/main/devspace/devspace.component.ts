import { Component } from '@angular/core';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  channelsOpen = false;
  messagesOpen = false;

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
