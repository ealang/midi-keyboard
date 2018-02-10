import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

export class TouchChangeEvent {
  eventType: string;
  identifier: number;
  touch: Touch;

  constructor(eventType: string, touch: Touch) {
    this.eventType = eventType;
    this.identifier = touch.identifier;
    this.touch = touch;
  }
}

@Directive({
  selector: '[appTouch]'
})
export class TouchDirective {
  @Output('appTouch') touch = new EventEmitter<TouchChangeEvent>();

  constructor() {}

  handleEvent(eventType: string, event: TouchEvent) {
    Array.from(event.changedTouches).forEach((touch) => {
      this.touch.emit(new TouchChangeEvent(eventType, touch));
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
