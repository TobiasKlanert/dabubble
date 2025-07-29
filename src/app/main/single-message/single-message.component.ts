import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProfileService } from '../../shared/services/profile.service';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { EmojiService } from '../../shared/services/emoji.service';


@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMenuComponent,
  ],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})

export class SingleMessageComponent {
  @Input() text!: string;
  @Input() outgoing = false;
  @Input() timestamp?: string;

  constructor (private profileService: ProfileService) {}

  openProfile(userId: string) {
    this.profileService.openUserProfile(userId);
  }
}
