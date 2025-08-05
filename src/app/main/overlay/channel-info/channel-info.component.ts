import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { ChannelService } from '../../../shared/services/channel.service';
import { Channel } from '../../../shared/models/database.model';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-info.component.html',
  styleUrl: './channel-info.component.scss',
})
export class ChannelInfoComponent {
  channel: Channel | null = null;
  channelCreator: string = '';

  isNameEditorActive: boolean = false;
  isDescriptionEditorActive: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private channelService: ChannelService,
    public textareaResizeService: TextareaResizeService
  ) {}

  ngOnInit() {
    this.channelService.selectedChannelId$.subscribe((id) => {
      if (id) {
        this.firestore.getChannel(id).subscribe((channel) => {
          this.channel = channel;
          this.firestore.getUser(channel.creatorId).subscribe((user) => {
            this.channelCreator = user.name;
          });
        });
      }
    });
  }

  closeOverlay() {
    this.overlayService.close();
  }

  toggleEditor(editor: string) {
    switch (editor) {
      case 'name':
        this.isNameEditorActive = !this.isNameEditorActive;
        break;
      case 'description':
        this.isDescriptionEditorActive = !this.isDescriptionEditorActive;
        break;
    }
  }

  saveEdit(editor: string) {
    switch (editor) {
      case 'name':
        this.toggleEditor('name');
        this.saveDataToArray('name');
        break;
      case 'description':
        this.toggleEditor('description');
        this.saveDataToArray('description');
        break;
    }
  }

  saveDataToArray(editor: string) {
    //Placeholder
    console.log(editor);
  }
}
