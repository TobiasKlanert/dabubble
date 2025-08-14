import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';
import { FirestoreService } from '../../../shared/services/firestore.service';
import { GlobalIdService } from '../../../shared/services/global-id.service';
import { Channel } from '../../../shared/models/database.model';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-info.component.html',
  styleUrl: './channel-info.component.scss',
})
export class ChannelInfoComponent {
  @ViewChild('inputName') inputName!: ElementRef;
  @ViewChild('inputDescription') inputDescription!: ElementRef;

  channelId: string = '';
  channel: Channel | null = null;
  channelCreator: string = '';

  isNameEditorActive: boolean = false;
  isDescriptionEditorActive: boolean = false;

  constructor(
    private overlayService: OverlayService,
    private firestore: FirestoreService,
    private globalIdService: GlobalIdService,
    public textareaResizeService: TextareaResizeService
  ) {}

  ngOnInit() {
    this.globalIdService.selectedChannelId$.subscribe((id) => {
      if (id) {
        this.channelId = id;
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
        const newName = this.inputName.nativeElement.value;
        this.toggleEditor('name');
        this.firestore
          .updateChannelName(this.channelId, newName)
          .catch((error) => console.error(error));
        break;
      case 'description':
        const newDescription = this.inputDescription.nativeElement.value;
        this.toggleEditor('description');
        this.firestore
          .updateChannelDescription(this.channelId, newDescription)
          .catch((error) => console.error(error));
        break;
    }
  }
}
