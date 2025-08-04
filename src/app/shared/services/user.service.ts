import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './../models/database.model'

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users: User[] = [
    {
      id: 'u1',
      name: 'Alice Müller',
      email: 'alice@example.com',
      profilePictureUrl: './assets/img/user1.png',
      joinedAt: '2024-03-01T10:00:00Z',
      onlineStatus: true,
    },
    {
      id: 'u2',
      name: 'Bob Schneider',
      email: 'bob@example.com',
      profilePictureUrl: './assets/img/user2.png',
      joinedAt: '2024-03-05T09:15:00Z',
      onlineStatus: false,
    },
    {
      id: 'u3',
      name: 'Clara Weiss',
      email: 'clara@example.com',
      profilePictureUrl: './assets/img/user3.png',
      joinedAt: '2024-04-10T12:30:00Z',
      onlineStatus: true,
    },
    {
      id: 'u4',
      name: 'David Braun',
      email: 'david@example.com',
      profilePictureUrl: './assets/img/user4.png',
      joinedAt: '2024-05-01T08:00:00Z',
      onlineStatus: false,
    },
  ];

  constructor() {
    this.usersSubject.next(this.users);
  }

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  getUsers(): User[] {
    return [...this.users];
  }

  selectUser(user: User) {
    this.selectedUserSubject.next(user);
  }
}
