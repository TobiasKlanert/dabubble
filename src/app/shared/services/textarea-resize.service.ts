import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextareaResizeService {
  constructor() {}

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto'; // Reset height
    const maxHeight = 90; // Max in px

    // Set new height up to the limit
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';

    // Optional: hide scroll but allow scrolling internally if over limit
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }
}
