import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';
import { TouchService, TouchEvent, ElemId } from '../../touch/touch.service';

import { KeyViewModel, createDefaultKeys } from './key.viewmodel';
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
  private static readonly eventTranslation = new Map<string, TouchStackEvent>([
    ['start', TouchStackEvent.Down],
    ['move', TouchStackEvent.Move],
    ['end', TouchStackEvent.Up]
  ]);
  private static readonly mouseId = 'mouse';
  private touches: TouchStack;
  private scrollActive_ = false;

  touchElemId = 'keys';
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
    touch: TouchService,
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
    touch.subscribeOrigin(this.touchElemId, (event: TouchEvent) => {
      this.onTouchEvent(event);
    });
  }

  private parseKeyFromElemId(elemId: ElemId): number {
    return elemId && Number(elemId.split(':')[1]);
  }

  onTouchEvent(event: TouchEvent): void {
    const keyIndex = this.parseKeyFromElemId(event.elemId);
    this.touches.push(event.touchId, keyIndex, KeysComponent.eventTranslation.get(event.eventType));
    if (this.scrollActive_) {
      this.touches.freezeAll();
    }
  }
}
