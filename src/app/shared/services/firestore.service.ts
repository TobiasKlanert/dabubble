import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  from,
  of,
  forkJoin,
  map,
  switchMap,
  combineLatest
} from 'rxjs';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  setDoc,
  docData,
  updateDoc,
  arrayRemove,
  query,
  where,
  orderBy,
  startAt,
  endAt,
} from '@angular/fire/firestore';
import {
  User,
  CreateUserData,
  UserChatPreview,
  Channel,
  CreateChannelData,
  DirectChat,
  Message,
} from '../models/database.model';
import { ChatType } from '../models/chat.enums';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  Auth,
  authState,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { log } from 'console';
import { channel } from 'diagnostics_channel';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private _loggedInUserId$ = new BehaviorSubject<string>('');
  loggedInUserId$ = this._loggedInUserId$.asObservable();

  constructor(private firestore: Firestore, private auth: Auth) {
    // Firebase-Auth-State beobachten
    authState(this.auth).subscribe((user) => {
      if (user) {
        this._loggedInUserId$.next(user.uid);
      } else {
        this._loggedInUserId$.next('');
      }
    });
  }

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

  getChannelMembers(channelId: string, chatType: ChatType): Observable<User[]> {
    if (chatType === ChatType.DirectMessage) return of([]);

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

  async removeMemberFromChannel(channelId: string, userId: string) {
    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, {
      members: arrayRemove(userId),
    });
  }

  /*  ##########
    Chats 
    ##########  */

  getChat(chatType: ChatType, chatId: string): Observable<DirectChat> {
    const chatRef = doc(this.firestore, `${chatType}/${chatId}`);

    return docData(chatRef, { idField: 'id' }) as Observable<DirectChat>;
  }

  getChats(userId: string): Observable<UserChatPreview[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    return collectionData(q, { idField: 'id' }).pipe(
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

  getChatMessages(chatType: ChatType, chatId: string): Observable<Message> {
    const messagesRef = collection(
      this.firestore,
      `${chatType}/${chatId}/messages`
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<any>;
  }

  getThread(
    /* chatType: ChatType, */
    chatId: string,
    messageId: string
  ): Observable<Message[]> {
    // Die Threads liegen als Subcollection unter der Message: z.B. channels/{chatId}/messages/{messageId}/thread
    const threadRef = collection(
      this.firestore,
      `channels/${chatId}/messages/${messageId}/thread`
    );
    const q = query(threadRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  async addMessage(chatType: ChatType, chatId: string, msg: Partial<Message>) {
    const messagesRef = collection(
      this.firestore,
      `${chatType}/${chatId}/messages`
    );

    const senderId = this._loggedInUserId$.getValue() || 'u1'; // hier setzten wir Gast als Fallback

    const newMessage: Omit<Message, 'id'> = {
      senderId,
      text: msg.text ?? '',
      createdAt: new Date().toISOString(),
      outgoing: true,
      reactions: {},
      editedAt: null,
      repliesCount: 0,
      thread: [],
    };
    console.log(newMessage);
    const docRef = await addDoc(messagesRef, newMessage);
    return { id: docRef.id, ...newMessage };
  }

  // id: string;
  // senderId: string;
  // text: string;
  // createdAt: string;
  // reactions?: Reaction;
  // outgoing: boolean;
  // editedAt?: string | null;
  // repliesCount?: number;
  // thread?: ThreadMessage[];

  /*  ##########
    Users 
    ##########  */

  /* Diese Methode nutzen, um ID des eingeloggten Users global zu speichern */
  setLoggedInUserId(userId: string) {
    this._loggedInUserId$.next(userId);
    console.log('aktiver User hat ID:', userId);
  }

  get loggedInUserId() {
    return this._loggedInUserId$.getValue();
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

  async logout(): Promise<void> {
    await signOut(this.auth);
    this._loggedInUserId$.next('');
  }

  setOnlineStatus(userId: string, newOnlineStatus: boolean) {
    const userRef = doc(this.firestore, 'users', userId);

    return updateDoc(userRef, { onlineStatus: newOnlineStatus });
  }

  /*  ########## Guest User ##########  */

  async loginAsGuest() {
    const credential = await signInWithEmailAndPassword(
      this.auth,
      'max.mustermann@example.com',
      'guest123'
    );
    return credential.user.uid;
  }
}
