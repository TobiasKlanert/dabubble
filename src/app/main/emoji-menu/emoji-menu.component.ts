import { Component } from '@angular/core';
import { EmojiService } from '../../services/emoji.service';

@Component({
  selector: 'app-emoji-menu',
  standalone: true,
  imports: [],
  templateUrl: './emoji-menu.component.html',
  styleUrl: './emoji-menu.component.scss'
})
export class EmojiMenuComponent {

  constructor(public emojiService: EmojiService) {}
}
