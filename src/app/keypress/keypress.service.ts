import { EventEmitter, Injectable } from '@angular/core';

import { Point } from '../geometry';

export enum KeypressEventType {
  Down, Move, Up
}

export class KeypressEvent {
  constructor(
    readonly eventType: KeypressEventType,
    readonly keyNumber: number,
    readonly coordinates: Point
  ) { }
}

@Injectable()
export class KeypressService {
  private static readonly eventTranslation = new Map<string, KeypressEventType>([
    ['start', KeypressEventType.Down],
    ['move', KeypressEventType.Move],
    ['end', KeypressEventType.Up]
  ]);
  private heldKeys = new Map<string, number>();        // touch id -> key number
  private heldKeysRefCount = new Map<number, number>();  // key number -> num touches
  private frozenIds = new Set<string>();

  keypressEvent = new EventEmitter<KeypressEvent>();

  emitEvent(identifier: string, keyNumber: number, touchEventType: string, coordinates: Point): void {
    const existingKeyIndex = this.heldKeys.get(identifier),
          isValidKey = keyNumber !== null,
          isExistingTouch = existingKeyIndex !== undefined,
          on = 1, off = -1,
          eventType = KeypressService.eventTranslation.get(touchEventType);

    if (eventType === KeypressEventType.Down && isValidKey) {
      if (isExistingTouch) {
        this.addRefCount(existingKeyIndex, off, coordinates);
      }
      this.addRefCount(keyNumber, on, coordinates);
      this.heldKeys.set(identifier, keyNumber);
    } else if (eventType === KeypressEventType.Move && isExistingTouch && isValidKey) {
      if (existingKeyIndex === keyNumber) {
        this.keypressEvent.emit(new KeypressEvent(
          KeypressEventType.Move,
          keyNumber,
          coordinates
        ));
      } else if (!this.frozenIds.has(identifier)) {
        this.addRefCount(existingKeyIndex, off, coordinates);
        this.addRefCount(keyNumber, on, coordinates);
        this.heldKeys.set(identifier, keyNumber);
      }
    } else if (eventType === KeypressEventType.Up && isExistingTouch) {
      this.heldKeys.delete(identifier);
      this.addRefCount(existingKeyIndex, off, coordinates);
      this.frozenIds.delete(identifier);
    }
  }

  freezeAll(): void {
    this.heldKeys.forEach((_, id) => {
      this.frozenIds.add(id);
    });
  }

  private addRefCount(keyNumber: number, delta: number, coordinates: Point): void {
    const prevCount = this.heldKeysRefCount.get(keyNumber) || 0,
          curCount = prevCount + delta;

    if (curCount > 0) {
      this.heldKeysRefCount.set(keyNumber, curCount);
    } else {
      this.heldKeysRefCount.delete(keyNumber);
    }

    if (prevCount > 0 && curCount === 0) {
      this.keypressEvent.emit(new KeypressEvent(
        KeypressEventType.Up,
        keyNumber,
        coordinates
      ));
    } else if (prevCount === 0 && curCount > 0) {
      this.keypressEvent.emit(new KeypressEvent(
        KeypressEventType.Down,
        keyNumber,
        coordinates
      ));
    }
  }
}
