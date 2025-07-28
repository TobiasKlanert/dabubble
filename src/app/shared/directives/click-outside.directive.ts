import { 
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output
 } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elm: ElementRef<HTMLElement>) { }

  @HostListener('document:mousedown', ['$event.target'])
  onGlobalClick(target: Node) {
    if(!this.elm.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
