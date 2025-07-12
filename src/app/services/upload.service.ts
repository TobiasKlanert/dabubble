import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, doc, setDoc, collectionGroup, writeBatch } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { collection as fbCollection, doc as fbDoc, setDoc as fbSetDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private http: HttpClient, private firestore: Firestore) {}

  async uploadJson() {
    const rawData: any = await firstValueFrom(this.http.get('../../assets/backend-dummy.json'));

    // USERS
    const userCollection = collection(this.firestore, 'users');
    for (const [userId, userData] of Object.entries(rawData.users)) {
      const userDoc = doc(userCollection, userId);
      await setDoc(userDoc, userData);
    }

    // CHANNELS
    const channelCollection = collection(this.firestore, 'channels');
    for (const [channelId, channelData] of Object.entries(rawData.channels as { [key: string]: { messages?: any; [key: string]: any } })) {
      const { messages, ...channelInfo } = channelData;
      const channelDoc = doc(channelCollection, channelId);
      await setDoc(channelDoc, channelInfo);

      // Messages als Subcollection "messages"
      const messagesCollection = collection(channelDoc, 'messages');
      for (const [msgId, message] of Object.entries(messages || {})) {
        const { threads, ...messageData } = message as { threads?: any; [key: string]: any };
        const messageDoc = doc(messagesCollection, msgId);
        await setDoc(messageDoc, messageData);

        // Threads als Subcollection
        if (threads) {
          const threadsCollection = collection(messageDoc, 'threads');
          for (const [threadId, threadData] of Object.entries(threads)) {
            const threadDoc = doc(threadsCollection, threadId);
            await setDoc(threadDoc, threadData);
          }
        }
      }
    }

    // CHATS
    const chatCollection = collection(this.firestore, 'chats');
    for (const [chatId, chatData] of Object.entries(rawData.chats)) {
      const { messages, ...chatInfo } = chatData as { messages?: any; [key: string]: any };
      const chatDoc = doc(chatCollection, chatId);
      await setDoc(chatDoc, chatInfo);

      const messagesCollection = collection(chatDoc, 'messages');
      for (const [msgId, messageData] of Object.entries(messages || {})) {
        const messageDoc = doc(messagesCollection, msgId);
        await setDoc(messageDoc, messageData);
      }
    }

    console.log('✅ JSON-Daten wurden erfolgreich hochgeladen.');
  }
}
