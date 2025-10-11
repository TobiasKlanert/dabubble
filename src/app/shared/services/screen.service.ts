import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {
  private readonly mobileBreakpoint = 1200;

  private isMobileSubject = new BehaviorSubject<boolean>(this.checkIsMobile());
  isMobile$ = this.isMobileSubject.asObservable();

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        map(() => this.checkIsMobile()),
        startWith(this.checkIsMobile())
      )
      .subscribe((isMobile) => {
        this.isMobileSubject.next(isMobile);
      });
  }

  private checkIsMobile(): boolean {
    return window.innerWidth < this.mobileBreakpoint;
  }

  updateIsMobile() {
    this.isMobileSubject.next(this.checkIsMobile());
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }
}
