import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Max Mustermann',
      pictureUrl: './assets/img/user1.png',
      status: true,
      mail: 'max.mustermann@example.com',
    },
    {
      id: '2',
      name: 'Erika Musterfrau',
      pictureUrl: './assets/img/user2.png',
      status: false,
      mail: 'erika.musterfrau@example.com',
    },
    {
      id: '3',
      name: 'John Doe',
      pictureUrl: './assets/img/user3.png',
      status: true,
      mail: 'john.doe@example.com',
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
