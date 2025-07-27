import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private userService: UserService,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.userService.selectedUser$.subscribe((user) => {
      this.user = user;
    });
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
