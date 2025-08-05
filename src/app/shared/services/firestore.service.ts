import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  docData,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, from, of, forkJoin, map, switchMap } from 'rxjs';
import {
  User,
  CreateUserData,
  UserChatPreview,
  Channel,
  CreateChannelData,
} from '../models/database.model';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

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

    return docData(channelRef, {idField: 'id'}) as Observable<Channel>;
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

  /*  ##########
    Chats 
    ##########  */

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

  /*  ##########
    Users 
    ##########  */

  getUser(userId: string): Observable<User> {
    const userRef = doc(this.firestore, 'users', userId);

    return from(getDoc(userRef)).pipe(
      map((snap) => {
        return { id: userId, ...snap.data() } as User;
      })
    );
  }

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
}
