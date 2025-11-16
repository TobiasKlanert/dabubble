import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  from,
  of,
  forkJoin,
  map,
  switchMap,
} from 'rxjs';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  addDoc,
  docData,
  updateDoc,
  arrayRemove,
  query,
  where,
  orderBy,
  collectionGroup,
} from '@angular/fire/firestore';
import {
  User,
  CreateUserData,
  UserChatPreview,
  Channel,
  CreateChannelData,
  DirectChat,
  Message,
  ThreadMessage,
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

  // TODO: Split monolith into individual servicesW

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

  async channelExists(name: string): Promise<{ exists: boolean; id?: string }> {
    const channelsRef = collection(this.firestore, 'channels');
    const q = query(channelsRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { exists: true };
    }

    return { exists: false };
  }

  async createChannel(
    data: CreateChannelData
  ): Promise<{ exists: boolean; id?: string }> {
    const check = await this.channelExists(data.name);
    if (check.exists) {
      return check;
    }

    const channelsRef = collection(this.firestore, 'channels');
    const newChannel = {
      name: data.name,
      description: data.description,
      creatorId: data.creatorId,
      createdAt: new Date().toISOString(),
      members: Array.from(new Set(data.members)),
    };

    const docRef = await addDoc(channelsRef, newChannel);
    return { exists: false, id: docRef.id };
  }

  async updateChannelName(
    channelId: string,
    newName: string
  ): Promise<{ exists: boolean }> {
    const check = await this.channelExists(newName);
    if (check.exists) {
      return check;
    }

    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, { name: newName });
    return { exists: false };
  }

  updateChannelDescription(
    channelId: string,
    newDescription: string
  ): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return updateDoc(channelRef, { description: newDescription });
  }

  async addMemberToChannel(
    channelId: string,
    userIds: string[]
  ): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const channelSnap = await getDoc(channelRef);
    const currentMembers: string[] = channelSnap.data()?.['members'] || [];

    const updatedMembers = Array.from(new Set([...currentMembers, ...userIds]));

    await updateDoc(channelRef, { members: updatedMembers });
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
          let partnerId = chat.participants.find((id: string) => id !== userId);

          // Self-Chat erkennen
          if (!partnerId) {
            partnerId = userId;
          }

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

  async getOrCreateDirectChatId(
    myUserId: string,
    otherUserId: string
  ): Promise<string> {
    const chatsRef = collection(this.firestore, 'chats');
    // Suche nach einem Chat, der genau diese beiden Teilnehmer hat
    const q = query(
      chatsRef,
      where('participants', 'array-contains', myUserId)
    );

    const chatsSnap = await getDocs(q);
    for (const docSnap of chatsSnap.docs) {
      const participants = docSnap.data()['participants'] as string[];
      // Prüfe, ob der Chat genau diese beiden User enthält
      if (
        participants.length === 2 &&
        participants.includes(otherUserId) &&
        participants.includes(myUserId)
      ) {
        return docSnap.id;
      }
    }

    // Falls kein Chat existiert, erstelle einen neuen
    const newChat = {
      participants: [myUserId, otherUserId],
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const docRef = await addDoc(chatsRef, newChat);
    return docRef.id;
  }

  getChatMessages(chatType: ChatType, chatId: string): Observable<Message[]> {
    const messagesRef = collection(
      this.firestore,
      `${chatType}/${chatId}/messages`
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  async getOrCreateSelfChat(userId: string): Promise<string> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(chatsRef, where('participants', '==', [userId, userId]));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Chat existiert bereits
      return querySnapshot.docs[0].id;
    }

    // Chat existiert nicht -> neuen erstellen
    const newChat = {
      participants: [userId, userId],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(chatsRef, newChat);

    // messages Subcollection muss nicht explizit angelegt werden,
    // die kannst du einfach beim ersten Message-Insert verwenden.
    return docRef.id;
  }

  getThread(
    /* chatType: ChatType, */
    chatId: string,
    messageId: string
  ): Observable<ThreadMessage[]> {
    // Die Threads liegen als Subcollection unter der Message: z.B. channels/{chatId}/messages/{messageId}/thread
    const threadRef = collection(
      this.firestore,
      `channels/${chatId}/messages/${messageId}/thread`
    );
    const q = query(threadRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<ThreadMessage[]>;
  }

  async addMessage(chatType: ChatType, chatId: string, msg: Partial<Message>) {
    const messagesRef = collection(
      this.firestore,
      `${chatType}/${chatId}/messages`
    );

    const senderId = this._loggedInUserId$.getValue();

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

  async updateMessageText(
    chatType: string,
    chatId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    const msgRef = doc(
      this.firestore,
      `${chatType}/${chatId}/messages/${messageId}`
    );

    await updateDoc(msgRef, {
      text: newText,
      editedAt: new Date().toISOString(),
    });
  }

  async findParentByMessageId(
    messageId: string
  ): Promise<{ type: 'channel' | 'directMessage'; parentId: string } | null> {
    const messagesGroup = collectionGroup(this.firestore, 'messages');
    const messagesSnap = await getDocs(messagesGroup);

    for (const docSnap of messagesSnap.docs) {
      if (docSnap.id === messageId) {
        const parentDoc = docSnap.ref.parent.parent;
        const path = docSnap.ref.path;

        if (path.startsWith('channels/')) {
          return { type: 'channel', parentId: parentDoc?.id ?? '' };
        } else if (path.startsWith('chats/')) {
          return { type: 'directMessage', parentId: parentDoc?.id ?? '' };
        }
      }
    }

    return null;
  }

  getChatPartnerId(chatId: string): Observable<string> {
    return this.loggedInUserId$.pipe(
      switchMap((myId) =>
        this.getChat(ChatType.DirectMessage, chatId).pipe(
          map((chat) => chat.participants.find((id) => id !== myId) ?? '')
        )
      )
    );
  }

  /*##############
  Threads
  ###############*/

  async addThreadMessage(
    chatId: string,
    messageId: string,
    msg: Partial<ThreadMessage>
  ) {
    const threadRef = collection(
      this.firestore,
      `channels/${chatId}/messages/${messageId}/thread`
    );

    const senderId = this._loggedInUserId$.getValue() || 'u1';

    const newThreadMessage: Omit<ThreadMessage, 'id'> = {
      senderId,
      text: msg.text ?? '',
      createdAt: new Date().toISOString(),
      outgoing: true,
      reactions: {},
      editedAt: null,
    };

    const docRef = await addDoc(threadRef, newThreadMessage);
    return { id: docRef.id, ...newThreadMessage };
  }


  async updateThreadMessageText(
  chatId: string,
  rootMessageId: string,
  threadMessageId: string,
  newText: string
): Promise<void> {
  const msgRef = doc(
    this.firestore,
    `channels/${chatId}/messages/${rootMessageId}/thread/${threadMessageId}`
  );

  await updateDoc(msgRef, {
    text: newText,
    editedAt: new Date().toISOString(),
  });
}

  /*  ##########
   Emojies 
   ##########  */

  getMessage(
    chatType: string,
    chatId: string,
    messageId: string
  ): Observable<Message> {
    const msgRef = doc(
      this.firestore,
      `${chatType}/${chatId}/messages/${messageId}`
    );
    return docData(msgRef, { idField: 'id' }) as Observable<Message>;
  }

  async updateMessageReaction(
    chatType: string,
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ) {
    const messageRef = doc(
      this.firestore,
      `${chatType}/${chatId}/messages/${messageId}`
    );

    const snap = await getDoc(messageRef);
    if (!snap.exists()) return;

    const data = snap.data() as Message;
    const reactions = data.reactions || {};

    if (!reactions[emoji]) {
      reactions[emoji] = { count: 1, userIds: [userId] };
    } else {
      if (!reactions[emoji].userIds.includes(userId)) {
        reactions[emoji].userIds.push(userId);
        reactions[emoji].count++;
      } else {
        // Optional: Toggle-Verhalten → Entfernen wenn bereits reagiert
        reactions[emoji].userIds = reactions[emoji].userIds.filter(
          (id) => id !== userId
        );
        reactions[emoji].count = Math.max(0, reactions[emoji].count - 1);
        if (reactions[emoji].count === 0) delete reactions[emoji];
      }
    }

    await updateDoc(messageRef, { reactions });
  }

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

  getUserLive(userId: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', userId);
    return docData(userRef, { idField: 'id' }) as Observable<User>;
  }

  updateUserName(userId: string, newName: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', userId);
    return updateDoc(userRef, { name: newName });
  }

  updateUserAvatar(newUrl: string): Promise<void> {
    const userId = this.loggedInUserId;
    if (!userId) {
      return Promise.reject();
    }
    const userRef = doc(this.firestore, 'users', userId);
    return updateDoc(userRef, { profilePictureUrl: newUrl });
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
