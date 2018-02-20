import { Component, EventEmitter, Output } from '@angular/core';
import { layout } from '../layout';
import { TouchChangeEvent } from '../../touch/touch.directive';

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

  @Output() scroll = new EventEmitter<number>();

  constructor() { }

  selected = false;
  rect: Rectangle = new Rectangle(
    layout.keyboardOffset,
    layout.keyboardOffset + layout.whiteKeyHeight,
    layout.whiteKeyWidth * layout.numWhiteKeys,
    layout.dragBarHeight
  );
  private lastCursorPos = 0;
  private identifier: string = null;

  startScrolling(x: number, identifier: string): void {
    this.selected = true;
    this.lastCursorPos = x;
    this.identifier = identifier;
  }

  updateScrolling(x: number): void {
    if (this.selected) {
      const offset = x - this.lastCursorPos;
      this.lastCursorPos = x;
      if (offset !== 0) {
        this.scroll.emit(offset);
      }
    }
  }

  endScrolling(): void {
    this.selected = false;
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const identifier = event.identifier.toString(),
          x = event.touch.clientX;
    if (event.eventType === 'touchstart') {
      if (!this.selected) {
        this.startScrolling(x, identifier);
      }
    } else if (event.eventType === 'touchmove') {
      if (this.identifier === identifier) {
        this.updateScrolling(x);
      }
    } else {
      if (this.identifier === identifier) {
        this.endScrolling();
      }
    }
  }
}
