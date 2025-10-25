// request-password.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';


@Component({
  selector: 'app-request-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './request-password.component.html',
  styleUrl: './request-password.component.scss',
})
export class RequestPasswordComponent {
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  showSuccess = false;
  errorMsg: string | null = null;

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.errorMsg = null;
    this.loading = true;
    try {
      const email = this.form.value.email as string;
      await this.auth.resetPassword(email);
      this.showSuccess = true;
    } catch (err: any) {
      // Häufige Fehler von Firebase übersetzen
      const code = err?.code as string | undefined;
      switch (code) {
        case 'auth/user-not-found':
          this.errorMsg = 'Es gibt kein Konto mit dieser Adresse.';
          break;
        case 'auth/invalid-email':
          this.errorMsg = 'Die Adresse ist ungültig.';
          break;
        case 'auth/too-many-requests':
          this.errorMsg = 'Zu viele Versuche. Bitte später erneut versuchen.';
          break;
        case 'auth/network-request-failed':
          this.errorMsg = 'Netzwerkfehler. Bitte Verbindung prüfen.';
          break;
        default:
          this.errorMsg = 'Etwas ist schiefgelaufen. Bitte später erneut versuchen.';
      }
    } finally {
      this.loading = false;
    }
  }

  async confirmSuccess() {
    // Pop up schließen und zum Login
    this.showSuccess = false;
    await this.router.navigate(['/login']);
  }
}
