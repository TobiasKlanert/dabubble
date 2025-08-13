import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { FirestoreService } from '../../shared/services/firestore.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showIntro = true;
  loading = false;
  authError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private firestoreService: FirestoreService,
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    setTimeout(() => (this.showIntro = false), 4000);
  }

  async onSubmit() {
  if (this.form.invalid || this.loading) return;
  this.loading = true;

  const { email, password } = this.form.value;
  try {
    const cred = await this.auth.login(String(email), String(password));
    console.log('UID des eingeloggten Users:', cred.user.uid);
    this.firestoreService.setLoggedInUserId(cred.user.uid)
    this.router.navigate(['/main']);
  } catch (err: any) {
    console.error('Login fehlgeschlagen:', err);
  } finally {
    this.loading = false;
  }
}
}
