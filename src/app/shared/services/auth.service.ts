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
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        await updateProfile(cred.user, { displayName: name, photoURL: profilePictureUrl });

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

        await sendEmailVerification(cred.user, {
            url: 'http://localhost:4200/verify-email' // AUF UNSERE DOMAIN ÄNDERN!
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
