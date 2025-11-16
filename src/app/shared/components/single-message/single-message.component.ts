import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { combineLatest } from 'rxjs';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import {
  Message,
  ThreadMessage,
  User,
} from '../../models/database.model';
import { HoverOutsideDirective } from '../../directives/hover-outside.directive';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { ChatService } from '../../services/chat.service';
import { OverlayService } from '../../services/overlay.service';
import { ToggleService } from '../../services/toggle.service';

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

  @Input() isThreadMessage: boolean = false;
  @Input() rootMessageId?: string;

  @Output() threadSelected = new EventEmitter<void>();

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
    private overlayService: OverlayService,
    private toggleService: ToggleService
  ) { }

  ngOnInit() {
    combineLatest([
      this.firestore.getThread(this.chatId, this.message.id),
      this.firestore.getUserLive(this.message.senderId),
    ]).subscribe(([thread, sender]) => {
      this.thread = thread || [];
      this.sender = sender;
    });

    // Hier Live-Update für Reactions
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
    // Ursprüngliche Nachricht am Angfang
    const rootMessage: ThreadMessage = {
      id: this.message.id,
      senderId: this.message.senderId,
      text: this.message.text,
      createdAt: this.message.createdAt,
      editedAt: this.message.editedAt,
      outgoing: this.message.outgoing,
      reactions: this.message.reactions ?? {}
    };

    // Ursprüngliche Nachricht + Antworten
    const fullThread = [rootMessage, ...(this.thread ?? [])];

    this.chatService.selectThread(fullThread);
    this.toggleService.setFalse();
    this.threadSelected.emit();
  }


  openEditMode() {
    this.showEditMode = true;
    this.editText = this.message.text;
  }

  closeEditMode() {
    this.showEditMode = false;
  }

  async saveEditedMessage() {
  const trimmed = this.editText.trim();
  if (!trimmed) {
    this.closeEditMode();
    return;
  }

  try {
    if (this.isThreadMessage && this.rootMessageId) {
      // Fall: wir bearbeiten eine Thread-Antwort
      await this.firestore.updateThreadMessageText(
        this.chatId,          // Channel-ID
        this.rootMessageId,   // Root-Message-ID
        this.message.id,      // Thread-Message-ID
        trimmed
      );
    } else {
      // Fall: normale Message im Hauptchat (oder Root im Thread-Panel)
      await this.firestore.updateMessageText(
        'channels',           // bei dir liegen Threads aktuell nur unter channels
        this.chatId,
        this.message.id,
        trimmed
      );
    }

    console.log('Message erfolgreich aktualisiert');
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Message:', error);
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
