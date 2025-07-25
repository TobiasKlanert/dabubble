import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../services/overlay.service';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
})
export class DevspaceComponent {
  channelsOpen = true;
  messagesOpen = true;

  channels: Channel[] = [];
  users: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private channelService: ChannelService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
    });

    this.userService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  onAddChannel() {
    this.overlayService.open('addChannel');
  }

  toggleChannels() {
    this.channelsOpen = !this.channelsOpen;
  }

  toggleMessages() {
    this.messagesOpen = !this.messagesOpen;
  }
}
