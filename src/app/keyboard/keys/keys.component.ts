import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { KeyViewModel, createDefaultKeys } from './key.viewmodel';
import { TouchChangeEvent } from '../touch/touch.directive';
import { TouchStack, TouchStackEvent } from './touchstack';

export enum KeyEventType {
  Down, Up
}

export class KeyEvent {
  constructor(readonly eventType: KeyEventType, readonly keyNumber: number) {
  }
}

@Component({
  // tslint:disable-next-line:component-selector (need component to be valid svg)
  selector: '[app-keys]',
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.css']
})
export class KeysComponent {
  private static readonly touchEventToEventStackType = new Map<string, TouchStackEvent>([
    ['touchstart', TouchStackEvent.Down],
    ['touchmove', TouchStackEvent.Move],
    ['touchend', TouchStackEvent.Up],
    ['touchcancel', TouchStackEvent.Up],
  ]);
  private static readonly mouseId = 'mouse';
  private touches: TouchStack;
  private mouseDown = false;
  private scrollActive_ = false;

  keys: Array<KeyViewModel>;
  labelFontSize: number;

  @Input() scrollPosition = 0;

  @Input() set scrollActive(active: boolean) {
    this.scrollActive_ = active;
    if (active) {
      this.touches.freezeAll();
    }
  }

  get scrollActive(): boolean {
    return this.scrollActive_;
  }

  @Output() keyEvent = new EventEmitter<KeyEvent>();

  constructor(
    layout: LayoutService,
    keyconfig: KeyConfigService,
    private readonly element: ElementRef
  ) {
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
    this.touches = new TouchStack(onKeyDown, onKeyUp);
    this.keys = createDefaultKeys(layout, keyconfig);
    this.labelFontSize = layout.labelFontSize;
  }

  private static getKeyIndexFromElement(element: Element): number {
    if (element !== null) {
      const attr = element.attributes.getNamedItem('data-keyindex');
      if (attr) {
        return Number(attr.value);
      }
    }
    return null;
  }

  onMouseDown(keyIndex: number): void {
    this.mouseDown = true;
    this.touches.push(KeysComponent.mouseId, keyIndex, TouchStackEvent.Down);
  }

  onMouseUp(): void {
    this.mouseDown = false;
    this.touches.push(KeysComponent.mouseId, null, TouchStackEvent.Up);
  }

  onMouseOver(keyIndex: number): void {
    if (this.mouseDown) {
      this.touches.push(KeysComponent.mouseId, keyIndex, TouchStackEvent.Move);
    }
  }

  onMouseOut(): void {
    if (this.mouseDown) {
      this.mouseDown = false;
      this.touches.push(KeysComponent.mouseId, null, TouchStackEvent.Up);
    }
  }

  onTouchEvent(event: TouchChangeEvent): void {
    const eventType = KeysComponent.touchEventToEventStackType.get(event.eventType),
          touchedKeyIndex = KeysComponent.getKeyIndexFromElement(event.element),
          identifier = event.identifier.toString();
    this.touches.push(identifier, touchedKeyIndex, eventType);
    if (this.scrollActive_) {
      this.touches.freezeAll();
    }
  }
}
