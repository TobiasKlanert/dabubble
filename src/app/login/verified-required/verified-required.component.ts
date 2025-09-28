import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-required',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex-center flex-column text-center p-8">
      <h1>Bitte bestätige deine E-Mail 📩</h1>
      <p>Wir haben dir eine Mail geschickt. Ohne Bestätigung kannst du die App nicht nutzen.</p>
      <a routerLink="/login" class="button-primary-style mt-4">Zurück zum Login</a>
    </div>
  `
})
export class VerifyRequiredComponent {}