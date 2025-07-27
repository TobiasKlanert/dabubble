import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { OverlayService } from './overlay.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private userService: UserService,
    private overlayService: OverlayService
  ) {}

  openUserProfile(userId: string): void {
    const user = this.userService.getUsers().find((u) => u.id === userId);
    if (user) {
      this.userService.selectUser(user);
      this.overlayService.open('profile');
    }
  }
}
