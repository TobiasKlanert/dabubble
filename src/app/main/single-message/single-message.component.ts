import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-single-message',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './single-message.component.html',
  styleUrl: './single-message.component.scss'
})
export class SingleMessageComponent {
 @Input() text!: string;
 @Input() outgoing = false;
 @Input() timestamp?: string;
}
