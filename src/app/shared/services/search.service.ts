import { Injectable } from '@angular/core';
import {
  Observable,
  map,
  combineLatest,
  takeUntil,
  BehaviorSubject,
} from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from '@angular/fire/firestore';
import { User, Channel } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private selectedUsers = new BehaviorSubject<User[]>([]);
  selectedUsers$ = this.selectedUsers.asObservable();

  constructor(private firestore: Firestore) {}

  setselectedUsers(users: User[]) {
    this.selectedUsers.next(users);
  }

  normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  createNameSearchTokens(fullName: string): string[] {
    const normalized = this.normalizeName(fullName);
    const parts = normalized.split(/\s+/); // trennt nach Leerzeichen

    return [
      normalized, // kompletter Name
      ...parts, // einzelne Wörter (Vor- & Nachname)
    ];
  }

  searchUsers(term: string): Observable<User[]> {
    const normalized = this.normalizeName(term);
    const usersRef = collection(this.firestore, 'users');

    // 1. Prefix-Suche auf nameSearch
    const prefixQuery = query(
      usersRef,
      orderBy('nameSearch'),
      startAt(normalized),
      endAt(normalized + '\uf8ff')
    );

    // 2. Exakte Suche in Tokens
    const tokenQuery = query(
      usersRef,
      where('nameSearchTokens', 'array-contains', normalized)
    );

    // ⚡ beide Ergebnisse mergen
    return combineLatest([
      collectionData(prefixQuery, { idField: 'id' }) as Observable<User[]>,
      collectionData(tokenQuery, { idField: 'id' }) as Observable<User[]>,
    ]).pipe(
      map(([prefixResults, tokenResults]) => {
        const all = [...prefixResults, ...tokenResults];
        // Doppelte rausfiltern
        const unique = all.filter(
          (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
        );
        return unique;
      })
    );
  }

  searchUsersAndChannels(term: string): Observable<(User | Channel)[]> {
    const normalized = this.normalizeName(term);

    // User-Suche nach Name
    const usersRef = collection(this.firestore, 'users');
    const prefixQuery = query(
      usersRef,
      orderBy('nameSearch'),
      startAt(normalized),
      endAt(normalized + '\uf8ff')
    );
    const tokenQuery = query(
      usersRef,
      where('nameSearchTokens', 'array-contains', normalized)
    );
    // User-Suche nach Email
    const emailQuery = query(
      usersRef,
      where('email', '==', term)
    );

    // Channel-Suche nach Name
    const channelsRef = collection(this.firestore, 'channels');
    const channelPrefixQuery = query(
      channelsRef,
      orderBy('name'),
      startAt(normalized),
      endAt(normalized + '\uf8ff')
    );

    return combineLatest([
      collectionData(prefixQuery, { idField: 'id' }) as Observable<User[]>,
      collectionData(tokenQuery, { idField: 'id' }) as Observable<User[]>,
      collectionData(emailQuery, { idField: 'id' }) as Observable<User[]>,
      collectionData(channelPrefixQuery, { idField: 'id' }) as Observable<Channel[]>,
    ]).pipe(
      map(([prefixResults, tokenResults, emailResults, channelResults]) => {
        const allUsers = [...prefixResults, ...tokenResults, ...emailResults];
        // Doppelte User entfernen
        const uniqueUsers = allUsers.filter(
          (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
        );
        // Channels einfach anhängen
        return [...uniqueUsers, ...channelResults];
      })
    );
  }
}
