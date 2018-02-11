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
  constructor(keyNumber) {
    this.keyNumber = keyNumber;
    const i = keyNumber % 12;
    this.black = i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
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
  private heldKeys = new Map<number, number>();  // touch id -> key number

  constructor() {
  }

  private getKeyNumberFromElement(elem: Element): number {
    if (elem !== null) {
      const attr = elem.attributes.getNamedItem('data-keynumber');
      if (attr !== null) {
        return Number(attr.value);
      }
    }
    return null;
  }

  private emitOnEvent(keyNumber: number): void {
    this.keyEvent.emit(new KeyEvent(KeyEventType.Down, keyNumber));
  }

  private emitOffEvent(keyNumber: number): void {
    this.keyEvent.emit(new KeyEvent(KeyEventType.Up, keyNumber));
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const touchedKey = this.getKeyNumberFromElement(event.element),
          isValidKey = touchedKey !== null,
          existingKey = this.heldKeys.get(event.identifier),
          isExistingTouch = existingKey !== undefined;

    if (event.eventType === 'touchstart' && isValidKey) {
      if (isExistingTouch) {
        this.emitOffEvent(existingKey);
      }
      this.emitOnEvent(touchedKey);
      this.heldKeys.set(event.identifier, touchedKey);
    } else if (event.eventType === 'touchmove' && isExistingTouch) {
      if (isValidKey && existingKey !== touchedKey) {
        this.emitOffEvent(existingKey);
        this.emitOnEvent(touchedKey);
        this.heldKeys.set(event.identifier, touchedKey);
      }
    } else if ((event.eventType === 'touchend' || event.eventType === 'touchcancel') && isExistingTouch) {
      this.heldKeys.delete(event.identifier);
      this.emitOffEvent(existingKey);
    }
  }
}
