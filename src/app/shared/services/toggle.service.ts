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
}

