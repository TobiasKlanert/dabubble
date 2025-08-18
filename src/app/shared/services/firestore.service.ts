import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  docData,
  updateDoc,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, from, of, forkJoin, map, switchMap } from 'rxjs';
import {
  User,
  CreateUserData,
  UserChatPreview,
  Channel,
  CreateChannelData,
  DirectChat,
} from '../models/database.model';
import { ChatType } from '../models/chat.enums';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  /*  ##########
    Channels 
    ##########  */

  getChannels(userId: string): Observable<Channel[]> {
    const channelRef = collection(this.firestore, 'channels');
    const q = query(channelRef, where('members', 'array-contains', userId));

    return collectionData(q, { idField: 'id' }) as Observable<Channel[]>;
  }

  getChannel(channelId: string): Observable<Channel> {
    const channelRef = doc(this.firestore, 'channels', channelId);

    return docData(channelRef, { idField: 'id' }) as Observable<Channel>;
  }

  getChannelMembers(channelId: string): Observable<User[]> {
    const channelRef = doc(this.firestore, 'channels', channelId);

    return from(getDoc(channelRef)).pipe(
      switchMap((channelSnap) => {
        const channelData = channelSnap.data();
        const memberIds: string[] = channelData?.['members'] || [];

        if (memberIds.length === 0) return of([]);

        const userObservables = memberIds.map((id) => this.getUser(id));
        return forkJoin(userObservables);
      })
    );
  }

  createChannel(data: CreateChannelData): Promise<string> {
    const channelsRef = collection(this.firestore, 'channels');
    const newChannel = {
      name: data.name,
      description: data.description,
      creatorId: data.creatorId,
      createdAt: new Date().toISOString(),
      members: Array.from(new Set(data.members)),
    };

    return addDoc(channelsRef, newChannel).then((docRef) => docRef.id);
  }

  updateChannelName(channelId: string, newName: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return updateDoc(channelRef, { name: newName });
  }

  updateChannelDescription(
    channelId: string,
    newDescription: string
  ): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return updateDoc(channelRef, { description: newDescription });
  }

  /*  ##########
    Chats 
    ##########  */

  getChat(chatId: string): Observable<DirectChat> {
    const chatRef = doc(this.firestore, 'chats', chatId);

    return docData(chatRef, { idField: 'id' }) as Observable<DirectChat>;
  }

  getChats(userId: string): Observable<UserChatPreview[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    return collectionData(q, { idField: 'id' }).pipe(
      // TODO: avoid any type
      switchMap((chats: any[]) => {
        const chatPreviews$ = chats.map(async (chat) => {
          const partnerId = chat.participants.find(
            (id: string) => id !== userId
          );
          const userDoc = doc(this.firestore, 'users', partnerId);
          const userSnap = await getDoc(userDoc);
          const partner = userSnap.data() as User;

          return {
            chatId: chat.id,
            chatCreatedAt: chat.createdAt,
            partner: {
              id: partnerId,
              name: partner.name,
              profilePictureUrl: partner.profilePictureUrl,
              onlineStatus: partner.onlineStatus,
            },
          };
        });

        return from(Promise.all(chatPreviews$));
      })
    );
  }

  // TODO: avoid any type
  getChatMessages(chatId: string, chatType: ChatType): Observable<any> {
    if (!chatId) return of([]);
    const messagesRef = collection(
      this.firestore,
      `${chatType}/${chatId}/messages`
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<any>;
  }

  /*  ##########
    Users 
    ##########  */

  /* Hier wird die ID des eingeloggten Users global gespeichert -> Standardwert '' mit Dummy-User-Daten ersetzen */
  private _loggedInUserId$ = new BehaviorSubject<string | ''>('u1');
  loggedInUserId$ = this._loggedInUserId$.asObservable();

  /* Diese Methode nutzen, um ID des eingeloggten Users global zu speichern */
  setLoggedInUserId(userId: string | '') {
    this._selectedUserId$.next(userId);
    console.log('aktiver User hat ID:', userId);
  }

  /* Nur für Auswahl eines Users (z.B. Mitglied eines Channels) nutzen, nicht für den angemeldeten User! */
  private _selectedUserId$ = new BehaviorSubject<string>('');
  selectedUserId$ = this._selectedUserId$.asObservable();

  setSelectedUserId(userId: string) {
    this._selectedUserId$.next(userId);
  }

  getUser(userId: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', userId);

    return from(getDoc(userRef)).pipe(
      map((snap) => {
        return { id: userId, ...snap.data() } as User;
      })
    );
  }

  /*  ##########
    Login
    ##########  */

  async addUser(userData: CreateUserData) {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const uid = userCredential.user.uid;

      const { password, ...safeUserData } = userData;

      const userToSave = {
        ...safeUserData,
        id: uid,
      };

      const usersRef = collection(this.firestore, 'users');
      await addDoc(usersRef, userToSave);
      console.log(`User erstellt mit UID: ${uid}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Users:', error);
    }
  }

  login(): Promise<User> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then((result) => {
      const firebaseUser = result.user;

      const appUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? '',
        email: firebaseUser.email ?? '',
        profilePictureUrl: firebaseUser.photoURL ?? '',
        joinedAt: new Date().toString(), // falls du keine eigene Quelle hast
        onlineStatus: true,
      };

      console.log('User angemeldet:', appUser);

      return appUser;
    });
  }

  logout(): Promise<void> {
    return this.auth.signOut();
  }
}
