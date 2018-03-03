import { Directive, HostListener, ElementRef } from '@angular/core';
import { TouchService } from './touch.service';

@Directive({
  selector: '[appTouchRoot]'
})
export class TouchRootDirective {
  private static mouseId = 'mouse';
  private mouseActive = false;

  constructor(private root: ElementRef, private touch: TouchService) {
  }

  private elementFromPoint(clientX: number, clientY: number): Element {
    const element = document.elementFromPoint(clientX, clientY);
    if (element && this.root.nativeElement.contains(element)) {
      return element;
    } else {
      return null;
    }
  }

  private touchNameFromPoint(clientX: number, clientY: number): string {
    const element = this.elementFromPoint(clientX, clientY);
    if (element !== null && element.hasAttribute('data-touch-id')) {
      return element.getAttribute('data-touch-id');
    } else {
      return null;
    }
  }

  @HostListener('touchstart', ['"start"', '$event'])
  @HostListener('touchmove', ['"move"', '$event'])
  @HostListener('touchend', ['"end"', '$event'])
  @HostListener('touchcancel', ['"end"', '$event'])
  onTouchEvent(eventType: string, event: TouchEvent): void {
    Array.from(event.changedTouches).forEach((touch) => {
      this.touch.emitEvent(
        eventType,
        'touch' + touch.identifier.toString(),
        this.touchNameFromPoint(touch.clientX, touch.clientY),
        {x: touch.clientX, y: touch.clientY}
      );
    });
    event.preventDefault();
  }

  @HostListener('mousedown', ['"start"', '$event'])
  @HostListener('mousemove', ['"move"', '$event'])
  @HostListener('mouseup', ['"end"', '$event'])
  @HostListener('mouseleave', ['"end"', '$event'])
  onMouseEvent(eventType: string, event: MouseEvent): void {
    if (eventType === 'start' || this.mouseActive) {
      this.touch.emitEvent(
        eventType,
        TouchRootDirective.mouseId,
        this.touchNameFromPoint(event.clientX, event.clientY),
        {x: event.clientX, y: event.clientY}
      );
    }
    if (eventType === 'start') {
      this.mouseActive = true;
    } else if (eventType === 'end') {
      this.mouseActive = false;
    }
    event.preventDefault();
  }
}
