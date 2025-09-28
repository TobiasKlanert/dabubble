import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex-center flex-column text-center p-8">
      <h1>Email bestätigt ✅</h1>
      <p>Danke, deine E-Mail-Adresse wurde erfolgreich bestätigt.</p>
      <a routerLink="/login" class="button-primary-style mt-4">Zum Login</a>
    </div>
  `
})
export class EmailVerifiedComponent {}