import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from './../../shared/services/message.service';
import { EmojiService } from '../../shared/services/emoji.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmojiMenuComponent } from '../emoji-menu/emoji-menu.component';
import { SingleMessageComponent } from '../single-message/single-message.component';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { OverlayService } from '../../shared/services/overlay.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { log } from 'console';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    SingleMessageComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmojiMenuComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  messages = [
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
    { text: 'Gut und dir?', outgoing: true, timestamp: '12:01' },
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' },
  ];
  messages$ = this.messageService.messages$;
  inputText: string = '';
  users: User[] = [];
  members: number = 0;

  constructor(
    private messageService: MessageService,
    private overlayService: OverlayService,
    private userService: UserService,
    public emojiService: EmojiService
  ) {}

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.userService.users$.subscribe((users) => {
      this.users = users;
      this.members = users.length;
      console.log(this.members);
    });
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.inputText.trim()) {
      const msg = {
        text: this.inputText.trim(),
        outgoing: true,
        timestamp: new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      console.log(msg);
      this.messages.push(msg);
      // this.messageService.addMessage(msg);
      this.inputText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {
      console.warn('Scroll to bottom failed:', err);
    }
  }

 addEmoji = (emoji: string) => {
  this.inputText += emoji;
};


  toggleEmojiPicker() {
    this.emojiService.togglePicker();
  }

  showChannelMembers() {
    this.overlayService.open('channelMembers');
  }

  openAddUserMenu() {
    this.overlayService.open('addUser');
  }
}
