import { Component, Input } from '@angular/core';
import { EmojiService } from '../../shared/services/emoji.service';
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

  constructor(public emojiService: EmojiService) { }

  @Input() onEmojiSelected!: (emoji: string) => void;
  addEmoji(index: number) {
    const emoji = this.emojiService.displayedEmojis[index];
    this.onEmojiSelected?.(emoji);
  }
}
