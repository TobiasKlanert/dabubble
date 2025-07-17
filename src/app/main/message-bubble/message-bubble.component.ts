import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss'
})
export class MessageBubbleComponent {
 @Input() text!: string;
 @Input() outgoing = false;
 @Input() timestamp?: string;
}
