import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private _overlayOpen$ = new BehaviorSubject<boolean>(false);
  overlayOpen$ = this._overlayOpen$.asObservable();

  open() {
    this._overlayOpen$.next(true);
  }

  close() {
    this._overlayOpen$.next(false);
  }

  toggle() {
    this._overlayOpen$.next(!this._overlayOpen$.value);
  }
}
