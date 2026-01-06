import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UploadService } from '../app/shared/services/upload.service';
import { SessionCleanupService } from './shared/services/session-cleanup.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dabubble';

  constructor(
    public uploadService: UploadService,
    private sessionCleanup: SessionCleanupService
  ) {}
  
  uploadJson() {
      this.uploadService.uploadJson();
    }

  @HostListener('window:beforeunload')
  handleBeforeUnload() {
    this.sessionCleanup.cleanupSession();
  }
}
