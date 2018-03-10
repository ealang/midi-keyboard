import { Injectable } from '@angular/core';
import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { TouchStack, TouchStackEvent } from './touchstack';

export enum KeypressEventType {
  Down, Up
}

export class KeypressEvent {
  constructor(
    readonly eventType: KeypressEventType,
    readonly keyNumber: number
  ) { }
}

@Injectable()
export class KeypressService {
  private static readonly eventTranslation = new Map<string, TouchStackEvent>([
    ['start', TouchStackEvent.Down],
    ['move', TouchStackEvent.Move],
    ['end', TouchStackEvent.Up]
  ]);
  keypressEvent = new EventEmitter<KeypressEvent>();

  private touches: TouchStack;

  constructor() {
    const onKeyDown = (keyNumber: number) => {
      this.keypressEvent.emit(new KeypressEvent(KeypressEventType.Down, keyNumber));
    };
    const onKeyUp = (keyNumber: number) => {
      this.keypressEvent.emit(new KeypressEvent(KeypressEventType.Up, keyNumber));
    };
    this.touches = new TouchStack(onKeyDown, onKeyUp);
  }

  emitEvent(touchId: string, keyNumber: number, touchEventType: string): void {
    this.touches.push(
      touchId,
      keyNumber,
      KeypressService.eventTranslation.get(touchEventType)
    );
  }

  // TODO: remove
  freezeAll(): void {
    this.touches.freezeAll();
  }
}
