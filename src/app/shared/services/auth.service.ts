import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user, signOut, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { SearchService } from './search.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private db = inject(Firestore);

    constructor(private firestore: FirestoreService, private searchService: SearchService) {}

    // Observable mit dem aktuellen User, nützlich für Guards und UI
    user$ = user(this.auth);

    async register(name: string, email: string, password: string, nameSearch: string, nameSearchTokens: [], profilePictureUrl: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);  // Konto erstellen
        await updateProfile(cred.user, { displayName: name, photoURL: profilePictureUrl });                // Profil setzen
        // User Dokument schreiben, aber ohne Passwort
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
        return cred.user;
    }

    login(email: string, password: string) {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    logout() {
        return signOut(this.auth);
    }

    // Google Login
    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(this.auth, provider);

        // User Doc anlegen falls neu, Avatar setzen wir erst in ChooseAvatar
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

    // Profil nach Avatarwahl fertigstellen
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
 