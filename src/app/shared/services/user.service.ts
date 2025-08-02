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
      email: 'max.mustermann@test.de',
      profilePictureUrl: './assets/img/user1.png',
      joinedAt: '2025-07-02T13:00:00Z',
      onlineStatus: true,
      channels: ['10', '11'],
      chats: {
        '100': {
          with: ['2'],
          createdAt: '2025-07-02T13:20:00Z',
          messages: {
            msg10: {
              senderId: '1',
              text: 'Hey Marie, hast du kurz Zeit?',
              createdAt: '2025-07-02T13:21:00Z',
              editedAt: '2025-07-02T13:21:00Z',
              reactions: {
                '👀': ['2'],
              },
            },
          },
        },
        '101': {
          with: ['3'],
          createdAt: '2025-07-03T11:00:00Z',
          messages: {
            msg11: {
              senderId: '3',
              text: 'Wegen dem Code Review...',
              createdAt: '2025-07-03T11:02:00Z',
              editedAt: '2025-07-02T13:21:00Z',
            },
          },
        },
      },
    },
    {
      id: '2',
      name: 'Marie Musterfrau',
      email: 'marie.musterfrau@test.de',
      profilePictureUrl: './assets/img/user2.png',
      joinedAt: '2025-07-03T08:00:00Z',
      onlineStatus: false,
      channels: ['10', '12'],
      chats: {
        '100': {
          with: ['1'],
          createdAt: '2025-07-02T13:20:00Z',
          messages: {
            msg10: {
              senderId: '1',
              text: 'Hey Marie, hast du kurz Zeit?',
              createdAt: '2025-07-02T13:21:00Z',
              editedAt: '2025-07-02T13:21:00Z',
              reactions: {
                '👀': ['2'],
              },
            },
          },
        },
        '102': {
          with: ['4'],
          createdAt: '2025-07-04T12:00:00Z',
          messages: {
            msg12: {
              senderId: '4',
              text: 'Lass uns das später besprechen.',
              createdAt: '2025-07-04T12:01:00Z',
              editedAt: '2025-07-02T13:21:00Z',
            },
          },
        },
      },
    },
    {
      id: '3',
      name: 'John Doe',
      email: 'john.doe@test.de',
      profilePictureUrl: './assets/img/user3.png',
      joinedAt: '2025-07-04T09:30:00Z',
      onlineStatus: true,
      channels: ['10'],
      chats: {
        '101': {
          with: ['1'],
          createdAt: '2025-07-03T11:00:00Z',
          messages: {
            msg11: {
              senderId: '3',
              text: 'Wegen dem Code Review...',
              createdAt: '2025-07-03T11:02:00Z',
              editedAt: '2025-07-02T13:21:00Z',
            },
          },
        },
        '103': {
          with: ['5', '6'],
          createdAt: '2025-07-05T15:00:00Z',
          messages: {
            msg13: {
              senderId: '6',
              text: 'Teammeeting morgen um 10 Uhr?',
              createdAt: '2025-07-05T15:02:00Z',
              editedAt: '2025-07-02T13:21:00Z',
              reactions: {
                '✅': ['3', '5'],
              },
            },
          },
        },
      },
    },
    {
      id: '4',
      name: 'Lisa Schmidt',
      email: 'lisa.schmidt@test.de',
      profilePictureUrl: './assets/img/user4.png',
      joinedAt: '2025-07-05T12:15:00Z',
      onlineStatus: false,
      channels: ['11'],
      chats: {
        '102': {
          with: ['2'],
          createdAt: '2025-07-04T12:00:00Z',
          messages: {
            msg12: {
              senderId: '4',
              text: 'Lass uns das später besprechen.',
              createdAt: '2025-07-04T12:01:00Z',
              editedAt: '2025-07-02T13:21:00Z',
            },
          },
        },
      },
    },
    {
      id: '5',
      name: 'Tom Meier',
      email: 'tom.meier@test.de',
      profilePictureUrl: './assets/img/user5.png',
      joinedAt: '2025-07-06T14:45:00Z',
      onlineStatus: true,
      channels: ['11', '12'],
      chats: {
        '103': {
          with: ['3', '6'],
          createdAt: '2025-07-05T15:00:00Z',
          messages: {
            msg13: {
              senderId: '6',
              text: 'Teammeeting morgen um 10 Uhr?',
              createdAt: '2025-07-05T15:02:00Z',
              editedAt: '2025-07-02T13:21:00Z',
              reactions: {
                '✅': ['3', '5'],
              },
            },
          },
        },
      },
    },
    {
      id: '6',
      name: 'Anna Weber',
      email: 'anna.weber@test.de',
      profilePictureUrl: './assets/img/user6.png',
      joinedAt: '2025-07-07T16:00:00Z',
      onlineStatus: false,
      channels: ['12'],
      chats: {
        '103': {
          with: ['3', '5'],
          createdAt: '2025-07-05T15:00:00Z',
          messages: {
            msg13: {
              senderId: '6',
              text: 'Teammeeting morgen um 10 Uhr?',
              createdAt: '2025-07-05T15:02:00Z',
              editedAt: '2025-07-02T13:21:00Z',
              reactions: {
                '✅': ['3', '5'],
              },
            },
          },
        },
      },
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
