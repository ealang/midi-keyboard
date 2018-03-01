import { Component, EventEmitter, Output } from '@angular/core';
import { TouchChangeEvent } from '../touch/touch.directive';
import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';

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
  private lastCursorPos = 0;
  private identifier: string;

  constructor(layout: LayoutService, keyconfig: KeyConfigService) {
    this.rect = new Rectangle(
      -layout.dragBarBorderWidth / 2,
      layout.keyboardOffset + layout.whiteKeyHeight,
      layout.dragBarBorderWidth + layout.whiteKeyWidth * keyconfig.numWhiteKeys,
      layout.dragBarHeight
    );
    this.strokeWidth = layout.dragBarBorderWidth;
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
