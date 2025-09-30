import { Injectable } from '@angular/core';
import {
  Observable,
  map,
  switchMap,
  of,
  combineLatest,
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
import { FirestoreService } from './firestore.service';
import { User, Channel } from '../models/database.model';
import { ChatType } from '../models/chat.enums';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private selectedUsers = new BehaviorSubject<User[]>([]);
  selectedUsers$ = this.selectedUsers.asObservable();

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService
  ) {}

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
    const emailQuery = query(usersRef, where('email', '==', term));

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
      collectionData(channelPrefixQuery, { idField: 'id' }) as Observable<
        Channel[]
      >,
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

  onSearch(
    value: string,
    chatType: ChatType = ChatType.None,
    channelMembers: User[] = [],
    currentChatPartner?: User
  ): Observable<(User | Channel)[]> {
    // Suche nach letztem @ oder #
    const atIndex = value.lastIndexOf('@');
    const hashIndex = value.lastIndexOf('#');

    let trigger = '';
    let triggerIndex = -1;
    if (atIndex > hashIndex) {
      trigger = '@';
      triggerIndex = atIndex;
    } else if (hashIndex > atIndex) {
      trigger = '#';
      triggerIndex = hashIndex;
    }

    // kein Trigger
    if (triggerIndex === -1) return of([]);
    // prüfe, ob Leerzeichen oder Zeilenanfang
    if (triggerIndex > 0 && !/\s/.test(value[triggerIndex - 1])) return of([]);

    const query = value.substring(triggerIndex + 1).trim();

    if (trigger === '#') {
      return this.searchChannel(query);
    }
    if (trigger === '@') {
      return this.searchMembers(
        query,
        chatType,
        channelMembers,
        currentChatPartner
      );
    }

    return of([]);
  }

  private searchChannel(query: string): Observable<Channel[]> {
    return this.firestoreService.loggedInUserId$.pipe(
      switchMap((userId) => this.firestoreService.getChannels(userId)),
      map((channels) =>
        query
          ? channels.filter((c) =>
              c.name.toLowerCase().includes(query.toLowerCase())
            )
          : channels
      )
    );
  }

  private searchMembers(
    query: string,
    chatType: ChatType,
    channelMembers: User[] = [],
    currentChatPartner?: User
  ): Observable<User[]> {
    if (chatType === ChatType.Channel) {
      const members = query
        ? channelMembers.filter((m) =>
            m.name.toLowerCase().includes(query.toLowerCase())
          )
        : channelMembers;
      return of(members);
    } else if (chatType === ChatType.DirectMessage && currentChatPartner) {
      return of([currentChatPartner]);
    } else {
      // Fallback: Alle User aus Firestore holen
      return this.searchUsers(query).pipe(
        map((users) =>
          query
            ? users.filter((u) =>
                u.name.toLowerCase().includes(query.toLowerCase())
              )
            : users
        )
      );
    }
  }

  insertMention(
    inputText: string,
    mention: string,
    cursor: number
  ): { newText: string; newCursor: number } {
    const triggerIndex = Math.max(
      inputText.lastIndexOf('@', cursor - 1),
      inputText.lastIndexOf('#', cursor - 1)
    );

    if (triggerIndex === -1) {
      const newText =
        inputText.substring(0, cursor) +
        mention +
        ' ' +
        inputText.substring(cursor);
      return { newText, newCursor: cursor + mention.length + 1 };
    } else {
      const before = inputText.substring(0, triggerIndex);
      const after = inputText.substring(cursor);

      const newText = before + mention + ' ' + after;
      const newCursor = before.length + mention.length + 1;

      return { newText, newCursor };
    }
  }
}
