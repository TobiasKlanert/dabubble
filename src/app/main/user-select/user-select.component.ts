import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../shared/services/search.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { User } from '../../shared/models/database.model';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-select.component.html',
  styleUrl: './user-select.component.scss'
})
export class UserSelectComponent {
  searchTerm = signal('');
  selectedUsers = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);

  private search$ = new Subject<string>();

  constructor(private searchService: SearchService) {
    // Suche "live" mit debounce
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.searchService.searchUsers(term))
      )
      .pipe(takeUntilDestroyed())
      .subscribe(users => {
        this.filteredUsers.set(
          users.filter(u => !this.selectedUsers().some(sel => sel.id === u.id))
        );
      });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    if (value.trim().length > 0) {
      this.search$.next(value);
    } else {
      this.filteredUsers.set([]);
    }
  }

  selectUser(user: User) {
    this.selectedUsers.update(list => [...list, user]);
    this.searchTerm.set('');
    this.filteredUsers.set([]);
  }

  removeUser(user: User) {
    this.selectedUsers.update(list => list.filter(u => u.id !== user.id));
  }

  selectFirstSuggestion() {
    const first = this.filteredUsers()[0];
    if (first) this.selectUser(first);
  }
}
