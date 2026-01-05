import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { FirestoreService } from '../../shared/services/firestore.service';
import { RegistrationDataService } from '../../shared/services/registration-data.service';
import { ChatService } from '../../shared/services/chat.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showIntro: boolean = true;
  loading: boolean = false;
  loginInvalid: boolean = false;
  googleLoginInvalid: boolean = false;
  authError: string | null = null;
  private readonly introStorageKey = 'dabubble_intro_seen';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private firestoreService: FirestoreService,
    private regData: RegistrationDataService,
    private chatService: ChatService
  ) { }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    const hasSessionStorage =
      typeof window !== 'undefined' && 'sessionStorage' in window;
    const introSeen = hasSessionStorage
      ? window.sessionStorage.getItem(this.introStorageKey) === 'true'
      : true;
    this.showIntro = !introSeen;

    if (this.showIntro) {
      setTimeout(() => {
        this.showIntro = false;
        if (hasSessionStorage) {
          window.sessionStorage.setItem(this.introStorageKey, 'true');
        }
      }, 4000);
    }
  }

  async onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.chatService.selectChatId('');

    const { email, password } = this.form.value;
    try {
      const cred = await this.auth.login(String(email), String(password));
      console.log('UID des eingeloggten Users:', cred.user.uid);
      this.firestoreService.setLoggedInUserId(cred.user.uid)
      this.router.navigate(['/main']);
    } catch (err: any) {
      console.error('Login fehlgeschlagen:', err);
      this.loginInvalid = true;
    } finally {
      this.loading = false;
    }
  }

  // NEU Google Login
  async onGoogleLogin() {
    if (this.loading) return;
    this.loading = true;
    this.chatService.selectChatId('');
    try {
      const user = await this.auth.signInWithGoogle();
      this.firestoreService.setLoggedInUserId(user.uid);

      // Daten für ChooseAvatar vormerken
      this.regData.setData('form', {
        name: user.displayName ?? '',
        email: user.email ?? '',
        password: '',
        google: true,
        uid: user.uid
      });

      this.router.navigate(['/choose-avatar']);
    } catch (err) {
      this.googleLoginInvalid = true;
    } finally {
      this.loading = false;
    }
  }

  async onGuestLogin() {
    if (this.loading) return;
    this.loading = true;
    this.chatService.selectChatId('');
    try {
      await this.firestoreService.loginAsGuest();
      this.router.navigate(['/main']);
    } finally {
      this.loading = false;
    }
  }
}
