import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RegistrationDataService } from '../../shared/services/registration-data.service';
import { CreateUserData } from '../../shared/models/database.model';
import { FirestoreService } from '../../shared/services/firestore.service';

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
  formData: any;

  avatars: string[] = [
    '/assets/img/user1.png',
    '/assets/img/user2.png',
    '/assets/img/user3.png',
    '/assets/img/user4.png',
    '/assets/img/user5.png',
    '/assets/img/user6.png',
  ]

  constructor(private regData: RegistrationDataService, private firestore: FirestoreService) { }

  ngOnInit(): void {
    this.formData = this.regData.getData('form');

    if (this.formData) {
      console.log('Name:', this.formData.name);
      console.log('Email:', this.formData.email);
      console.log('Passwort:', this.formData.password);
      console.log('Privacy akzeptiert:', this.formData.privacy);
    }
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
    this.addUserToFirebase()
  }

  get isAvatarChosen(): boolean {
    return this.selectedAvatar !== '';
  }

  addUserToFirebase(): void {
    if (!this.formData) {
      console.error('Keine Formulardaten vorhanden!');
      return;
    }

    const user: CreateUserData = {
      name: this.formData.name,
      email: this.formData.email,
      profilePictureUrl: this.selectedAvatar,
      joinedAt: new Date().toISOString(),
      onlineStatus: true,
      password: this.formData.password,
    }
    this.firestore.addUser(user);
  }

}
