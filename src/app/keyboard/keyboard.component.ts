import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TouchChangeEvent } from '../touch/touch.directive';

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
  @Input() set keyRange(startEnd: [number, number]) {
    this.keys = [];
    for (let i = startEnd[0]; i < startEnd[1]; i++) {
      this.keys.push(new KeyViewModel(i));
    }
  }
  @Output() keyEvent = new EventEmitter<KeyEvent>();

  keys: Array<KeyViewModel> = [];
  private heldKeys = new Map<number, number>();  // touch id -> keys index

  constructor() {
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

  private changeKeyState(keyIndex: number, state: string): void {
    const key = this.keys[keyIndex];
    if (state === 'on') {
      key.held = true;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Down, key.keyNumber));
    } else {
      key.held = false;
      this.keyEvent.emit(new KeyEvent(KeyEventType.Up, key.keyNumber));
    }
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const touchedKeyIndex = this.getKeyIndexFromElement(event.element),
          existingKeyIndex = this.heldKeys.get(event.identifier),
          isValidKey = touchedKeyIndex !== null,
          isExistingTouch = existingKeyIndex !== undefined;

    if (event.eventType === 'touchstart' && isValidKey) {
      if (isExistingTouch) {
        this.changeKeyState(existingKeyIndex, 'off');
      }
      this.changeKeyState(touchedKeyIndex, 'on');
      this.heldKeys.set(event.identifier, touchedKeyIndex);
    } else if (event.eventType === 'touchmove' && isExistingTouch) {
      if (isValidKey && existingKeyIndex !== touchedKeyIndex) {
        this.changeKeyState(existingKeyIndex, 'off');
        this.changeKeyState(touchedKeyIndex, 'on');
        this.heldKeys.set(event.identifier, touchedKeyIndex);
      }
    } else if ((event.eventType === 'touchend' || event.eventType === 'touchcancel') && isExistingTouch) {
      this.heldKeys.delete(event.identifier);
      this.changeKeyState(existingKeyIndex, 'off');
    }
  }
}
