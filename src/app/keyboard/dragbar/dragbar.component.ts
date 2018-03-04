import { Component, EventEmitter, Output } from '@angular/core';
import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { TouchService, TouchEvent } from '../../touch/touch.service';

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
  @Output() scrollActive = new EventEmitter<boolean>();

  selected = false;
  rect: Rectangle;
  strokeWidth: number;
  touchElemId = 'dragbar';
  private lastCursorPos = 0;
  private identifier: string;

  constructor(layout: LayoutService, keyconfig: KeyConfigService, touch: TouchService) {
    this.rect = new Rectangle(
      -layout.dragBarBorderWidth / 2,
      layout.keyboardOffset + layout.whiteKeyHeight,
      layout.dragBarBorderWidth + layout.whiteKeyWidth * keyconfig.numWhiteKeys,
      layout.dragBarHeight
    );
    this.strokeWidth = layout.dragBarBorderWidth;
    touch.subscribeRoaming(this.touchElemId, (event: TouchEvent) => this.onTouchEvent(event));
  }

  startScrolling(x: number, identifier: string): void {
    this.selected = true;
    this.lastCursorPos = x;
    this.identifier = identifier;
    this.scrollActive.emit(true);
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
    if (this.selected) {
      this.selected = false;
      this.scrollActive.emit(false);
    }
  }

  onTouchEvent(event: TouchEvent): void {
    const identifier = event.touchId,
          x = event.coordinates.x;
    if (event.eventType === 'start') {
      if (!this.selected) {
        this.startScrolling(x, identifier);
      }
    } else if (event.eventType === 'move') {
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
