import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user, signOut, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private db = inject(Firestore);

    // Observable mit dem aktuellen User, nützlich für Guards und UI
    user$ = user(this.auth);

    async register(name: string, email: string, password: string, photoURL: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);  // Konto erstellen
        await updateProfile(cred.user, { displayName: name, photoURL });                // Profil setzen
        // User Dokument schreiben, aber ohne Passwort
        await setDoc(doc(this.db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            name,
            email: cred.user.email,
            photoURL,
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
                photoURL: cred.user.photoURL ?? '',
                joinedAt: serverTimestamp(),
                onlineStatus: true
            },
            { merge: true }
        );

        return cred.user;
    }

    // Profil nach Avatarwahl fertigstellen
    async completeProfileAfterAvatar(name: string, photoURL: string) {
        if (!this.auth.currentUser) return;
        await updateProfile(this.auth.currentUser, { displayName: name, photoURL });
        await setDoc(
            doc(this.db, 'users', this.auth.currentUser.uid),
            { name, photoURL, onlineStatus: true },
            { merge: true }
        );
    }
}
