import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  user, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendEmailVerification
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { SearchService } from './search.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private db = inject(Firestore);

    constructor(private firestore: FirestoreService, private searchService: SearchService) {}

    user$ = user(this.auth);

    async register(
        name: string, 
        email: string, 
        password: string, 
        nameSearch: string, 
        nameSearchTokens: [], 
        profilePictureUrl: string
    ) {
        // 1. User in Firebase Authentication anlegen
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);

        // 2. Profil setzen (Name + Avatar)
        await updateProfile(cred.user, { displayName: name, photoURL: profilePictureUrl });

        // 3. Firestore-Dokument anlegen
        await setDoc(doc(this.db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            name,
            email: cred.user.email,
            nameSearch,
            nameSearchTokens,
            profilePictureUrl,
            joinedAt: serverTimestamp(),
            onlineStatus: true
        });

        // 4. Bestätigungsmail schicken
        await sendEmailVerification(cred.user, {
            url: 'http://localhost:4200/email-verified' // später auf die Domain anpassen
        });

        return cred.user;
    }

    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    logout() {
        return signOut(this.auth);
    }

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(this.auth, provider);

        await setDoc(
            doc(this.db, 'users', cred.user.uid),
            {
                uid: cred.user.uid,
                name: cred.user.displayName ?? '',
                email: cred.user.email ?? '',
                nameSearch: this.searchService.normalizeName(cred.user.displayName ?? ''),
                nameSearchTokens: this.searchService.createNameSearchTokens(cred.user.displayName ?? ''),
                profilePictureUrl: cred.user.photoURL ?? '',
                joinedAt: serverTimestamp(),
                onlineStatus: true
            },
            { merge: true }
        );

        return cred.user;
    }

    async completeProfileAfterAvatar(name: string, profilePictureUrl: string) {
        if (!this.auth.currentUser) return;
        await updateProfile(this.auth.currentUser, { displayName: name, photoURL: profilePictureUrl });
        await setDoc(
            doc(this.db, 'users', this.auth.currentUser.uid),
            { name, profilePictureUrl, onlineStatus: true },
            { merge: true }
        ); 
    }
}
