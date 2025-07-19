import { Component } from '@angular/core';
import { OverlayService } from '../../services/overlay.service';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';

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

  channels: Channel[] = [];

  constructor(
    private overlayService: OverlayService,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
    });
  }

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
