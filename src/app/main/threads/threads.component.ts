import { Component } from '@angular/core';

@Component({
  selector: 'app-threads',
  standalone: true,
  imports: [],
  templateUrl: './threads.component.html',
  styleUrl: './threads.component.scss'
})
export class ThreadsComponent {

  activeMessage = [
    { text: 'Hey, wie geht’s?', outgoing: false, timestamp: '12:00' },
  ]

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
  ]
}
