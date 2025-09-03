import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/database.model';

@Component({
  selector: 'app-search-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-menu.component.html',
  styleUrl: './search-menu.component.scss',
})
export class SearchMenuComponent {
  @Input() searchResults: User[] = [];

  constructor() {}

  addUser(id: string) {
    console.log(id);
  }
}
