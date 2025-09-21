import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {
  private stateSource = new BehaviorSubject<boolean>(false);
  state$ = this.stateSource.asObservable();

  toggle() {
    this.stateSource.next(!this.stateSource.value);
  }

  setTrue() {
    this.stateSource.next(false);
  }

  setFalse() {
    this.stateSource.next(true);
  }

  set(value: boolean) {
    this.stateSource.next(value);
  }

  get value() {
    return this.stateSource.value;
  }
}
