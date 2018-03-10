export enum TouchStackEvent {
  Down, Move, Up
}

export class TouchStack {
  private heldKeys = new Map<string, number>();        // touch id -> keys index
  private heldKeysRefCount = new Map<number, number>();  // index -> num touches
  private frozenIds = new Set<string>();

  constructor(
    private onKeyDown: (keyNumber: number) => void,
    private onKeyUp: (keyNumber: number) => void
  ) {}

  private pushState(keyNumber: number, delta: number): void {
    const prevCount = this.heldKeysRefCount.get(keyNumber) || 0,
          curCount = prevCount + delta;

    if (curCount > 0) {
      this.heldKeysRefCount.set(keyNumber, curCount);
    } else {
      this.heldKeysRefCount.delete(keyNumber);
    }

    if (prevCount > 0 && curCount === 0) {
      this.onKeyUp(keyNumber);
    } else if (prevCount === 0 && curCount > 0) {
      this.onKeyDown(keyNumber);
    }
  }

  push(identifier: string, keyNumber: number, eventType: TouchStackEvent): void {
    const existingKeyIndex = this.heldKeys.get(identifier),
          isValidKey = keyNumber !== null,
          isExistingTouch = existingKeyIndex !== undefined,
          on = 1, off = -1;

    if (eventType === TouchStackEvent.Down && isValidKey) {
      if (isExistingTouch) {
        this.pushState(existingKeyIndex, off);
      }
      this.pushState(keyNumber, on);
      this.heldKeys.set(identifier, keyNumber);
    } else if (eventType === TouchStackEvent.Move && isExistingTouch) {
      if (isValidKey && existingKeyIndex !== keyNumber && !this.frozenIds.has(identifier)) {
        this.pushState(existingKeyIndex, off);
        this.pushState(keyNumber, on);
        this.heldKeys.set(identifier, keyNumber);
      }
    } else if (eventType === TouchStackEvent.Up && isExistingTouch) {
      this.heldKeys.delete(identifier);
      this.pushState(existingKeyIndex, off);
      this.frozenIds.delete(identifier);
    }
  }

  reset(): void {
    this.heldKeysRefCount.forEach((_, keyNumber) => {
      this.onKeyUp(keyNumber);
    });
    this.heldKeys.clear();
    this.heldKeysRefCount.clear();
    this.frozenIds.clear();
  }

  freezeAll(): void {
    this.heldKeys.forEach((_, id) => {
      this.frozenIds.add(id);
    });
  }
}
