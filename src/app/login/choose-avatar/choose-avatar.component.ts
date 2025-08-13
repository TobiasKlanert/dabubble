import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegistrationDataService } from '../../shared/services/registration-data.service';
import { AuthService } from '../../shared/services/auth.service';
import { FirestoreService } from '../../shared/services/firestore.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  selectedAvatar = '';
  formData: any;
  loading = false;

  avatars: string[] = [
    '/assets/img/user1.png',
    '/assets/img/user2.png',
    '/assets/img/user3.png',
    '/assets/img/user4.png',
    '/assets/img/user5.png',
    '/assets/img/user6.png',
  ];

  constructor(
    private regData: RegistrationDataService,
    private auth: AuthService,
    private router: Router,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit(): void {
    this.formData = this.regData.getData('form');
    if (!this.formData) {
      console.error('Keine Formulardaten vorhanden');
    }
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  get isAvatarChosen(): boolean {
    return this.selectedAvatar !== '';
  }

  async finishRegistration(): Promise<void> {
    if (!this.formData || !this.isAvatarChosen || this.loading) return;
    this.loading = true;

    try {
      const user = await this.auth.register(
        this.formData.name,
        this.formData.email,
        this.formData.password,
        this.selectedAvatar
      );
      console.log('UID des neu registrierten Users:', user.uid);
      this.firestoreService.setLoggedInUserId(user.uid)
      this.router.navigate(['/main']);
    } catch (err) {
      console.error('Registrierung fehlgeschlagen:', err);
    } finally {
      this.loading = false;
    }
  }
}
