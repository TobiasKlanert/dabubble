import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { TextareaResizeService } from '../../../shared/services/textarea-resize.service';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-info.component.html',
  styleUrl: './channel-info.component.scss',
})
export class ChannelInfoComponent {
  isNameEditorActive = false;
  isDescriptionEditorActive = false;

  constructor(
    private overlayService: OverlayService,
    public textareaResizeService: TextareaResizeService
  ) {}

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
