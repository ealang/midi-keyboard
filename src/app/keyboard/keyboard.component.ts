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
    this.heldIndexes.clear();
    this.heldIndexRefCount.clear();
  }
  @Output() keyEvent = new EventEmitter<KeyEvent>();

  keys: Array<KeyViewModel> = [];
  private heldIndexes = new Map<number, number>();        // touch id -> keys index
  private heldIndexRefCount = new Map<number, number>();  // index -> num touches

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

  private pushKeyState(keyIndex: number, state: string): void {
    const key = this.keys[keyIndex],
          refCount = this.heldIndexRefCount.get(keyIndex) || 0;

    if (state === 'on') {
      this.heldIndexRefCount.set(keyIndex, refCount + 1);
      if (refCount === 0) {
        key.held = true;
        this.keyEvent.emit(new KeyEvent(KeyEventType.Down, key.keyNumber));
      }
    } else {
      this.heldIndexRefCount.set(keyIndex, refCount - 1);
      if (refCount === 1) {
        key.held = false;
        this.keyEvent.emit(new KeyEvent(KeyEventType.Up, key.keyNumber));
      }
    }
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const touchedKeyIndex = this.getKeyIndexFromElement(event.element),
          existingKeyIndex = this.heldIndexes.get(event.identifier),
          isValidKey = touchedKeyIndex !== null,
          isExistingTouch = existingKeyIndex !== undefined;

    if (event.eventType === 'touchstart' && isValidKey) {
      if (isExistingTouch) {
        this.pushKeyState(existingKeyIndex, 'off');
      }
      this.pushKeyState(touchedKeyIndex, 'on');
      this.heldIndexes.set(event.identifier, touchedKeyIndex);
    } else if (event.eventType === 'touchmove' && isExistingTouch) {
      if (isValidKey && existingKeyIndex !== touchedKeyIndex) {
        this.pushKeyState(existingKeyIndex, 'off');
        this.pushKeyState(touchedKeyIndex, 'on');
        this.heldIndexes.set(event.identifier, touchedKeyIndex);
      }
    } else if ((event.eventType === 'touchend' || event.eventType === 'touchcancel') && isExistingTouch) {
      this.heldIndexes.delete(event.identifier);
      this.pushKeyState(existingKeyIndex, 'off');
    }
  }
}
