import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevspaceComponent } from './devspace/devspace.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadsComponent } from './threads/threads.component';
import { OverlayService } from '../shared/services/overlay.service';
import { UploadService } from '../shared/services/upload.service';
import { OverlayComponent } from './overlay/overlay.component';
import { FirestoreService } from '../shared/services/firestore.service';
import { ChannelService } from '../shared/services/channel.service';

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
  userId: string = 'u1';
  firstChannelId: string = '';
  isWorkspaceHidden: boolean = false;

  constructor(
    public uploadService: UploadService,
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private channelService: ChannelService
  ) {}

  ngOnInit() {
    this.firestore.getChannels(this.userId).subscribe((channels) => {
      this.channelService.setChannels(channels);
      this.firstChannelId = channels[0].id;
      this.channelService.setChannelId(this.firstChannelId);
    });
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

  openProfileMenu() {
    this.overlayService.open('profileMenu');
  }

  toggleWorkspaceMenu() {
    this.isWorkspaceHidden = !this.isWorkspaceHidden;
  }
}
