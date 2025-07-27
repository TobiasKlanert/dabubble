import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    RouterLink,
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  selectedAvatar: string = '';

  avatars: string[] = [
    '/assets/img/user1.png',
    '/assets/img/user2.png',
    '/assets/img/user3.png',
    '/assets/img/user4.png',
    '/assets/img/user5.png',
    '/assets/img/user6.png',
  ]

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  get isAvatarChosen(): boolean {
    return this.selectedAvatar !== '';
  }

}
