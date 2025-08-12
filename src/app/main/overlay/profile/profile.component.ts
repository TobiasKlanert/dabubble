import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayService } from '../../../shared/services/overlay.service';
import { User } from '../../../shared/models/database.model';
import { FirestoreService } from '../../../shared/services/firestore.service';

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
    private firestore: FirestoreService,
    private overlayService: OverlayService
  ) {}

  ngOnInit() {
    this.firestore.selectedUserId$.subscribe((userId) => {
      this.firestore.getUser(userId).subscribe((user) => {
        this.user = user;
      });
    });
  }

  closeOverlay() {
    this.overlayService.close();
  }
}
