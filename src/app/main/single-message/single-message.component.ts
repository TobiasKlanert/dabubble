import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { Reaction } from '../../shared/models/reaction.model';
import { Message, ThreadMessage } from '../../shared/models/database.model';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore.service';
import { OverlayService } from '../../shared/services/overlay.service';

@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMenuComponent,
    HoverOutsideDirective,
    ClickOutsideDirective,
    FormsModule,
  ],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss',
})
export class SingleMessageComponent {
  @Input() message!: Message;
  @Input() chatId!: string;

  userId: string = '';
  editText = '';

  thread!: ThreadMessage[];
  reactions: Reaction[] = [];

  showEmojiPicker = false;
  showEmojiPickerInEditMode = false;
  showEditMode = false;

  constructor(
    private firestore: FirestoreService,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.firestore
      .getThread(this.chatId, this.message.id)
      .subscribe((thread) => {
        if (thread.length > 0) {
          this.thread = thread;
        }
      });
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  openEditMode() {
    this.showEditMode = true;
    this.editText = this.message.text;
  }

  closeEditMode() {
    this.showEditMode = false;
  }

  // TODO: Revise the saveEditedMessage method so that synchronization with Firestore takes place
  saveEditedMessage() {
    if (this.editText.trim()) {
      const msg = {
        text: this.editText.trim(),
      };
      console.log(msg);
      // this.messageService.addMessage(msg);  <--!> Implementierung der MessageService <-->
    }
    this.closeEditMode();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEditEmojiPicker() {
    this.showEmojiPickerInEditMode = !this.showEmojiPickerInEditMode;
  }

  // TODO: Revise the addReactionEmoji method so that synchronization with Firestore takes place
  addReactionEmoji = (emoji: string) => {
    const existingReaction = this.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      existingReaction.amount += 1;
      existingReaction.userName.push('dummy-user-id'); // später UserDaten verwenden
    } else {
      this.reactions.push({
        emoji,
        amount: 1,
        userName: ['dummy-user-id'],
      });
    }

    this.showEmojiPicker = false;
  };

  addTextEmoji = (emoji: string) => {
    this.editText += emoji;
  };
}
