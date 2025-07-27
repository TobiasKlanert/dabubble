import { Component } from '@angular/core';
import { EmojiService } from '../../services/emoji.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emoji-menu',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './emoji-menu.component.html',
  styleUrl: './emoji-menu.component.scss'
})
export class EmojiMenuComponent {

  constructor(public emojiService: EmojiService) {}

  addEmoji(index: number) {

  }
}
