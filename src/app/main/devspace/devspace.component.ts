import { Component } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  channelsOpen = true;
  messagesOpen = true;

  constructor(private overlayService: OverlayService) {}

  onAddChannel() {
    this.overlayService.open();
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
