import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { TouchService, TouchEvent, ElemId } from '../../touch/touch.service';

class Rectangle {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number
  ) { }
}

@Component({
  // tslint:disable-next-line:component-selector (need component to be valid svg)
  selector: '[app-dragbar]',
  templateUrl: './dragbar.component.html',
  styleUrls: ['./dragbar.component.css']
})
export class DragbarComponent {
  selected = false;
  touchElemId_: ElemId;

  @Input() width: number;
  @Input() height: number;
  @Input() strokeWidth: number;

  @Output() scroll = new EventEmitter<number>();
  @Output() scrollActive = new EventEmitter<boolean>();

  @Input() set touchElemId(elemId: ElemId) {
    this.touchElemId_ = elemId;
    this.touch.subscribeSticky(elemId, (event: TouchEvent) => this.onTouchEvent(event));
  }

  get touchElemId(): ElemId {
    return this.touchElemId_;
  }

  private lastIdPosition = new Map<string, number>();

  constructor(private touch: TouchService) {
  }

  startScrolling(identifier: string, x: number): void {
    this.lastIdPosition.set(identifier, x);
    if (!this.selected) {
      this.selected = true;
      this.scrollActive.emit(true);
    }
  }

  updateScrolling(identifier: string, x: number): void {
    if (this.selected) {
      const offset = x - this.lastIdPosition.get(identifier);
      if (offset !== 0) {
        this.scroll.emit(offset);
        this.lastIdPosition.set(identifier, x);
      }
    }
  }

  endScrolling(identifier: string): void {
    this.lastIdPosition.delete(identifier);
    if (this.lastIdPosition.size === 0) {
      this.selected = false;
      this.scrollActive.emit(false);
    }
  }

  onTouchEvent(event: TouchEvent): void {
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
