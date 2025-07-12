import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: '',
        appId: '',
        storageBucket: '',
        apiKey: '',
        authDomain: '',
        messagingSenderId: '',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({"projectId":"dabubble-f9213","appId":"1:972305143062:web:6037944975fbf1242bec37","storageBucket":"dabubble-f9213.firebasestorage.app","apiKey":"AIzaSyBvmuwL9UUuxTggIKPvZ1Njr1hANLsYB6U","authDomain":"dabubble-f9213.firebaseapp.com","messagingSenderId":"972305143062"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  ],
};
