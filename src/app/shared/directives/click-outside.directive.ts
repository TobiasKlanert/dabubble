import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  HostListener,
  inject
} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);
  @Output() clickOutside = new EventEmitter<Event>();

  private wasInside = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.wasInside = this.elementRef.nativeElement.contains(event.target);
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && !this.wasInside) {
      this.clickOutside.emit(event);
    }
    this.wasInside = false;
  }
}
