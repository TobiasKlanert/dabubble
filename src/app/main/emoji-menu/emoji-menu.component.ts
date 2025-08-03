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

  @Input() onTextEmojiSelected!: (emoji: string) => void;
  addTextEmoji(index: number) {
    const emoji = this.emojiService.displayedEmojis[index];
    this.onTextEmojiSelected?.(emoji);
  }

  @Input() onReactionEmojiSelected!: (emoji: string) => void;
  addReactionEmoji(index: number) {
    const emoji = this.emojiService.displayedEmojis[index];
    this.onReactionEmojiSelected?.(emoji);
  }
}
