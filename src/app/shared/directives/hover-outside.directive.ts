import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  HostListener,
  inject
} from '@angular/core';

@Directive({
  selector: '[hoverOutside]',
  standalone: true
})
export class HoverOutsideDirective {
  private elementRef = inject(ElementRef);

  @Output() hoverOutside = new EventEmitter<void>();

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    const related = event.relatedTarget as HTMLElement;
    const inside = this.elementRef.nativeElement.contains(related);

    // Wenn die Maus *wirklich rausgeht*, nicht nur zu einem Kind-Element
    if (!inside) {
      this.hoverOutside.emit();
    }
  }
}
