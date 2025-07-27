import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UploadService } from '../app/shared/services/upload.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'dabubble';

  constructor(public uploadService: UploadService) {}
  
  uploadJson() {
      this.uploadService.uploadJson();
    }
}
