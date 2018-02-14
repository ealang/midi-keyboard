import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TouchChangeEvent } from '../touch/touch.directive';
import { TouchStack, TouchStackEvent } from './touchstack';

export enum KeyEventType {
  Down, Up
}

export class KeyEvent {
  eventType: KeyEventType;
  keyNumber: number;
  constructor(eventType: KeyEventType, keyNumber: number) {
    this.eventType = eventType;
    this.keyNumber = keyNumber;
  }
}

class KeyViewModel {
  keyNumber: number;
  black: boolean;
  held: boolean;
  constructor(keyNumber) {
    this.keyNumber = keyNumber;
    const i = keyNumber % 12;
    this.black = i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
    this.held = false;
  }
}

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent {
  private static readonly touchEventToEventStackType = new Map<string, TouchStackEvent>([
    ['touchstart', TouchStackEvent.Down],
    ['touchmove', TouchStackEvent.Move],
    ['touchend', TouchStackEvent.Up],
    ['touchcancel', TouchStackEvent.Up],
  ]);
  private static readonly mouseId = 'mouse';

  @Input() set keyRange(startEnd: [number, number]) {
    this.keys = [];
    for (let i = startEnd[0]; i < startEnd[1]; i++) {
      this.keys.push(new KeyViewModel(i));
    }
    this.stack.reset();
    this.mouseDown = false;
  }
  @Output() keyEvent = new EventEmitter<KeyEvent>();

  keys: Array<KeyViewModel> = [];
  private stack: TouchStack;
  private mouseDown = false;

  constructor() {
    const onKeyDown = (keyIndex: number) => {
      const key = this.keys[keyIndex];
      key.held = true;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Down, key.keyNumber));
    };
    const onKeyUp = (keyIndex: number) => {
      const key = this.keys[keyIndex];
      key.held = false;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Up, key.keyNumber));
    };
    this.stack = new TouchStack(onKeyDown, onKeyUp);
  }

  private getKeyIndexFromElement(elem: Element): number {
    if (elem !== null) {
      const attr = elem.attributes.getNamedItem('data-keyindex');
      if (attr !== null) {
        return Number(attr.value);
      }
    }
    return null;
  }

  onMouseDown(keyIndex: number): void {
    this.mouseDown = true;
    this.stack.push(KeyboardComponent.mouseId, keyIndex, TouchStackEvent.Down);
  }

  onMouseUp(): void {
    this.mouseDown = false;
    this.stack.push(KeyboardComponent.mouseId, null, TouchStackEvent.Up);
  }

  onMouseOver(keyIndex: number): void {
    if (this.mouseDown) {
      this.stack.push(KeyboardComponent.mouseId, keyIndex, TouchStackEvent.Move);
    }
  }

  onMouseOut(): void {
    if (this.mouseDown) {
      this.mouseDown = false;
      this.stack.push(KeyboardComponent.mouseId, null, TouchStackEvent.Up);
    }
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const eventType = KeyboardComponent.touchEventToEventStackType.get(event.eventType),
          touchedKeyIndex = this.getKeyIndexFromElement(event.element);
    this.stack.push(event.identifier.toString(), touchedKeyIndex, eventType);
  }
}
