import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, query, where } from '@angular/fire/firestore';
import { Observable, from, forkJoin, map, switchMap } from 'rxjs';
import { User, UserChatPreview } from '../models/database.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  getAllChats(userId: string): Observable<UserChatPreview[]> {
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
}
