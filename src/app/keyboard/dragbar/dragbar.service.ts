import { Injectable, EventEmitter } from '@angular/core';
import { TouchService, TouchEvent, ElemId } from '../touch/touch.service';

@Injectable()
export class DragbarService {
  private lastIdPosition = new Map<string, number>();
  private selected = false;

  readonly touchElemId = 'dragBar';
  readonly scroll = new EventEmitter<number>();
  readonly scrollActive = new EventEmitter<boolean>();

  constructor(touch: TouchService) {
    touch.subscribeSticky(this.touchElemId, (event: TouchEvent) => this.onTouchEvent(event));
  }

  private startScrolling(identifier: string, x: number): void {
    this.lastIdPosition.set(identifier, x);
    if (!this.selected) {
      this.selected = true;
      this.scrollActive.emit(true);
    }
  }

  private updateScrolling(identifier: string, x: number): void {
    if (this.selected) {
      const offset = x - this.lastIdPosition.get(identifier);
      if (offset !== 0) {
        this.scroll.emit(offset);
        this.lastIdPosition.set(identifier, x);
      }
    }
  }

  private endScrolling(identifier: string): void {
    this.lastIdPosition.delete(identifier);
    if (this.lastIdPosition.size === 0) {
      this.selected = false;
      this.scrollActive.emit(false);
    }
  }

  private onTouchEvent(event: TouchEvent): void {
    const identifier = event.touchId,
          x = event.coordinates.x;
    if (event.eventType === 'start') {
      this.startScrolling(identifier, x);
    } else if (event.eventType === 'move') {
      this.updateScrolling(identifier, x);
    } else {
      this.endScrolling(identifier);
    }
  }
}
