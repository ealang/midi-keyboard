import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TouchChangeEvent } from '../touch/touch.directive';
import { TouchStack, TouchStackEvent } from './touchstack';
import { KeyViewModel, createKeysViewModel } from './viewmodel';

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
  private elemWidth: number;
  private _keySize: number;
  private _keyStart: number;
  private stack: TouchStack;
  private mouseDown = false;
  keys: Array<KeyViewModel> = [];

  @Input() set keySize(keySize: number) {
    this._keySize = keySize;
    this.resetKeyboard();
  }

  @Input() set keyStart(keyStart: number) {
    this._keyStart = keyStart;
    this.resetKeyboard();
  }

  @Output() keyEvent = new EventEmitter<KeyEvent>();

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
    this.resetKeyboard();
  }

  private resetKeyboard(): void {
    this.keys = createKeysViewModel(this._keyStart || 0, this._keySize || 0, this.elemWidth || 0);
    this.stack.reset();
    this.mouseDown = false;
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

  onResize({width}: {width: number, height: number}): void {
    this.elemWidth = width;
    this.resetKeyboard();
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
