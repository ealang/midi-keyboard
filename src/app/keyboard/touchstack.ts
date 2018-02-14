export enum TouchStackEvent {
  Down, Move, Up
}

export class TouchStack {
  private heldIndexes = new Map<string, number>();        // touch id -> keys index
  private heldIndexRefCount = new Map<number, number>();  // index -> num touches

  constructor(
    private onKeyDown: (keyIndex: number) => void,
    private onKeyUp: (keyIndex: number) => void
  ) {}

  private pushState(keyIndex: number, delta: number): void {
    const prevCount = this.heldIndexRefCount.get(keyIndex) || 0,
          curCount = prevCount + delta;

    if (curCount > 0) {
      this.heldIndexRefCount.set(keyIndex, curCount);
    } else {
      this.heldIndexRefCount.delete(keyIndex);
    }

    if (prevCount > 0 && curCount === 0) {
      this.onKeyUp(keyIndex);
    } else if (prevCount === 0 && curCount > 0) {
      this.onKeyDown(keyIndex);
    }
  }

  push(identifier: string, keyIndex: number, eventType: TouchStackEvent): void {
    const existingKeyIndex = this.heldIndexes.get(identifier),
          isValidKey = keyIndex !== null,
          isExistingTouch = existingKeyIndex !== undefined,
          on = 1, off = -1;

    if (eventType === TouchStackEvent.Down && isValidKey) {
      if (isExistingTouch) {
        this.pushState(existingKeyIndex, off);
      }
      this.pushState(keyIndex, on);
      this.heldIndexes.set(identifier, keyIndex);
    } else if (eventType === TouchStackEvent.Move && isExistingTouch) {
      if (isValidKey && existingKeyIndex !== keyIndex) {
        this.pushState(existingKeyIndex, off);
        this.pushState(keyIndex, on);
        this.heldIndexes.set(identifier, keyIndex);
      }
    } else if (eventType === TouchStackEvent.Up && isExistingTouch) {
      this.heldIndexes.delete(identifier);
      this.pushState(existingKeyIndex, off);
    }
  }

  reset(): void {
    this.heldIndexRefCount.forEach((_, keyIndex) => {
      this.onKeyUp(keyIndex);
    });
    this.heldIndexes.clear();
    this.heldIndexRefCount.clear();
  }
}
