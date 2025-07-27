import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type OverlayMenuType = 'addChannel' | 'profileMenu' | 'profile' | null;

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private _overlayOpen$ = new BehaviorSubject<boolean>(false);
  overlayOpen$ = this._overlayOpen$.asObservable();

  private _activeMenu$ = new BehaviorSubject<OverlayMenuType>(null);
  activeMenu$ = this._activeMenu$.asObservable();

  open(menu: OverlayMenuType) {
    this._activeMenu$.next(menu);
    this._overlayOpen$.next(true);
  }

  close() {
    this._overlayOpen$.next(false);
    this._activeMenu$.next(null);
  }

  toggle(menu: OverlayMenuType) {
    const isOpen = this._overlayOpen$.value;
    const currentMenu = this._activeMenu$.value;

    if (isOpen && currentMenu === menu) {
      this.close();
    } else {
      this.open(menu);
    }
  }
}
