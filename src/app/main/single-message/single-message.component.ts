import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { Reaction } from '../../shared/models/reaction.model';
import {
  Message,
  ThreadMessage,
  User,
} from '../../shared/models/database.model';
import { HoverOutsideDirective } from '../../shared/directives/hover-outside.directive';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore.service';
import { ChatService } from '../../shared/services/chat.service';
import { OverlayService } from '../../shared/services/overlay.service';
import { doc, updateDoc } from '@angular/fire/firestore';

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
  @Input() showButtons = false;

  userId: string = '';
  editText = '';

  sender!: User;
  thread!: ThreadMessage[];
  reactions: { emoji: string; amount: number; userName: string[] }[] = [];

  showEmojiPicker = false;
  showEmojiPickerInEditMode = false;
  showEditMode = false;

  constructor(
    private firestore: FirestoreService,
    private chatService: ChatService,
    private overlayService: OverlayService
  ) { }

  ngOnInit() {
    combineLatest([
      this.firestore.getThread(this.chatId, this.message.id),
      this.firestore.getUserLive(this.message.senderId),
    ]).subscribe(([thread, sender]) => {
      this.thread = thread || [];
      this.sender = sender;
    });

    // 👇 Hier Live-Update für Reactions
    this.firestore
      .getMessage('channels', this.chatId, this.message.id)
      .subscribe((msg) => {
        this.reactions = Object.entries(msg?.reactions ?? {}).map(
          ([emoji, data]: any) => ({
            emoji,
            amount: data?.count ?? 0,
            userName: data?.userIds ?? [],
          })
        );
      });
  }

  openProfile(userId: string) {
    this.firestore.setSelectedUserId(userId);
    this.overlayService.open('profile');
  }

  openThread() {
    this.chatService.selectThread(this.thread);
  }

  openEditMode() {
    this.showEditMode = true;
    this.editText = this.message.text;
  }

  closeEditMode() {
    this.showEditMode = false;
  }

  async saveEditedMessage() {
  if (this.editText.trim()) {
    try {
      await this.firestore.updateMessageText(
        'channels',          // Anpassen je nach dem wo die MEssages liegen
        this.chatId,
        this.message.id,
        this.editText.trim()
      );
      console.log('Message erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Message:', error);
    }
  }
  this.closeEditMode();
}

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  toggleEditEmojiPicker() {
    this.showEmojiPickerInEditMode = !this.showEmojiPickerInEditMode;
  }

  addReactionEmoji = async (emoji: string) => {
    const userId = this.firestore.loggedInUserId;
    if (!userId) return;

    await this.firestore.updateMessageReaction(
      'channels', // oder 'chats', je nach Kontext
      this.chatId,
      this.message.id,
      emoji,
      userId
    );

    this.showEmojiPicker = false;
  };

  addTextEmoji = (emoji: string) => {
    this.editText += emoji;
  };
}
