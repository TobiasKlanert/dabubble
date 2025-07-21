import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { CommonModule } from '@angular/common';
import { MessageService } from './../../services/message.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { log } from 'console';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MessageBubbleComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
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
    { text: 'Auch gut!', outgoing: false, timestamp: '12:02' }
  ];
  messages$ = this.messageService.messages$;

  constructor(private messageService: MessageService) { }

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    // this.scrollToBottom();
  }

  inputText: string = '';

  sendMessage() {
    console.log('moin');
    
    if (this.inputText.trim()) {
      const msg = {
        text: this.inputText.trim(),
        outgoing: true,
        timestamp: new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        })
      };
      console.log(msg);
      this.messages.push(msg);
      // this.messageService.addMessage(msg);
      this.inputText = '';
    }
  }
}