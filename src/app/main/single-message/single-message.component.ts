import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProfileService } from '../../shared/services/profile.service';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { Reaction } from '../../shared/models/reaction.model';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMenuComponent,
    HoverOutsideDirective,
    ClickOutsideDirective,
    FormsModule
  ],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})

export class SingleMessageComponent {
  @Input() text!: string;
  @Input() outgoing = false;
  @Input() timestamp?: string;

  inputText = this.text;
  editText = this.text;

  reactions: Reaction[] = []

  showEmojiPicker = false;
  showEmojiPickerInEditMode = false;
  showEditMode = false;

  constructor(private profileService: ProfileService) { }

  openProfile(userId: string) {
    this.profileService.openUserProfile(userId);
  }

  openEditMode() {
    this.showEditMode = true;
    this.inputText = this.text;
  }

  closeEditMode() {
    this.showEditMode = false;  
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEditEmojiPicker() {
    this.showEmojiPickerInEditMode = !this.showEmojiPickerInEditMode;
  }

  addReactionEmoji = (emoji: string) => {
    const existingReaction = this.reactions.find(r => r.emoji === emoji);

    if (existingReaction) {
      existingReaction.amount += 1;
      existingReaction.userName.push('dummy-user-id'); // später UserDaten verwenden
    } else {
      this.reactions.push({
        emoji,
        amount: 1,
        userName: ['dummy-user-id']
      });
    }

    this.showEmojiPicker = false;
  };

  addTextEmoji = (emoji: string) => {
    console.log('triggered')
    
    this.inputText += emoji;
  };
}
