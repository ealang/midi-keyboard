import { Directive, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';

export class TouchChangeEvent {
  eventType: string;
  identifier: number;
  touch: Touch;
  element: Element;
  constructor(eventType: string, touch: Touch, element: Element) {
    this.eventType = eventType;
    this.identifier = touch.identifier;
    this.touch = touch;
    this.element = element;
  }
}

@Directive({
  selector: '[appTouch]'
})
export class TouchDirective {
  // tslint:disable-next-line:no-output-rename
  @Output('appTouch') touch = new EventEmitter<TouchChangeEvent>();

  private touchElem: Element;

  constructor(touchElem: ElementRef) {
    this.touchElem = touchElem.nativeElement;
  }

  protected elementFromPoint(clientX: number, clientY: number): Element {
    const elem = document.elementFromPoint(clientX, clientY);
    if (elem && this.touchElem.contains(elem)) {
      return elem;
    } else {
      return null;
    }
  }

  handleEvent(eventType: string, event: TouchEvent) {
    Array.from(event.changedTouches).forEach((touch) => {
      const elem = this.elementFromPoint(touch.clientX, touch.clientY);
      this.touch.emit(new TouchChangeEvent(eventType, touch, elem));
    });
    event.preventDefault();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.handleEvent('touchstart', event);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.handleEvent('touchmove', event);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.handleEvent('touchend', event);
  }

  @HostListener('touchcancel', ['$event'])
  onTouchCancel(event: TouchEvent) {
    this.handleEvent('touchcancel', event);
  }
}
