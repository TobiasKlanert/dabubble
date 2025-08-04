import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/database.model';
import { ProfileService } from '../../../shared/services/profile.service';

@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss',
})
export class ChannelMembersComponent {
  users: User[] = [];

  constructor(
    private overlayService: OverlayService,
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  openProfile(userId: string) {
    this.profileService.openUserProfile(userId);
  }

  openAddUserDialog() {
    this.overlayService.open('addUser');
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
