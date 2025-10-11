import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {
  private readonly mobileBreakpoint = 1200;

  private isMobileSubject = new BehaviorSubject<boolean>(
    window.innerWidth < this.mobileBreakpoint
  );

  isMobile$ = this.isMobileSubject.asObservable();

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        map(() => window.innerWidth < this.mobileBreakpoint),
        startWith(window.innerWidth < this.mobileBreakpoint)
      )
      .subscribe((isMobile) => this.isMobileSubject.next(isMobile));
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
