import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmailVerifiedGuard {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate: CanActivateFn = () => {
    return user(this.auth).pipe(
      map(u => {
        if (u && u.emailVerified) {
          return true;
        }
        this.router.navigate(['/verify-required']);
        return false;
      })
    );
  };
}
