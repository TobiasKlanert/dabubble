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
import { User, Channel, Message } from '../models/database.model';
import { ChatType, SearchType } from '../models/chat.enums';

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

  resetState() {
    this.selectedUsers.next([]);
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
    searchType: SearchType,
    chatType: ChatType = ChatType.None,
    channelMembers: User[] = [],
    currentChatPartner?: User
  ): Observable<(any)[]> {
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
    if (searchType === SearchType.Keyword) {
      return this.firestoreService.loggedInUserId$.pipe(
        switchMap((id) => this.searchMessages(id, query))
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
    return this.searchUsers(query).pipe(
      map((users) =>
        query
          ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
          : users
      )
    );
  }

  searchMessages(userId: string, searchTerm: string): Observable<Message[]> {
    const lowerTerm = searchTerm.toLowerCase();

    // Channels + Chats für den User laden
    return combineLatest([
      this.firestoreService.getChannels(userId),
      this.firestoreService.getChats(userId),
    ]).pipe(
      switchMap(([channels, chats]) => {
        const messageStreams: Observable<Message[]>[] = [];

        // Channels Messages
        channels.forEach((channel) =>
          messageStreams.push(
            this.firestoreService.getChatMessages(ChatType.Channel, channel.id)
          )
        );

        // Direct Chats Messages
        chats.forEach((chat) =>
          messageStreams.push(
            this.firestoreService.getChatMessages(
              ChatType.DirectMessage,
              chat.chatId
            )
          )
        );

        // Wenn keine Channels/Chats vorhanden, leeres Array zurückgeben
        if (messageStreams.length === 0) {
          return of([]);
        }

        // combineLatest erwartet ein Array von Observables<Message[]>
        return combineLatest(messageStreams as Observable<Message[]>[]);
      }),
      // Alle Messages flatten und nach searchTerm filtern
      map((allMessages: Message[][]) =>
        allMessages
          .flat()
          .filter((msg) => msg.text?.toLowerCase().includes(lowerTerm))
      )
    );
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
