import { Component } from '@angular/core';
import { OverlayService } from '../../../shared/services/overlay.service';

@Component({
  selector: 'app-channel-info',
  standalone: true,
  imports: [],
  templateUrl: './channel-info.component.html',
  styleUrl: './channel-info.component.scss',
})
export class ChannelInfoComponent {
  constructor(private overlayService: OverlayService) {}

  closeOverlay() {
    this.overlayService.close();
  }
}
