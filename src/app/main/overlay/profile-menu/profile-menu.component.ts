import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
})
export class ProfileMenuComponent {

  openProfile() {
    console.log("Profil öffnen");
  }

  logout() {
    console.log("Logout");
  }
}
