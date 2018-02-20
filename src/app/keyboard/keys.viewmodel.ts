import { layout } from './layout';

function isBlackKey(keyNumber: number): boolean {
  const i = keyNumber % 12;
  return i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
}

export class KeyViewModel {
  readonly black: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  held: boolean;

  constructor(readonly keyNumber: number, xOffset: number) {
    this.black = isBlackKey(keyNumber);
    this.x = layout.keyboardOffset + xOffset + (this.black ? -layout.blackKeyWidth / 2 : 0);
    this.y = layout.keyboardOffset;
    this.width = this.black ? layout.blackKeyWidth : layout.whiteKeyWidth;
    this.height = this.black ? layout.blackKeyHeight : layout.whiteKeyHeight;
    this.resetState();
  }

  resetState(): void {
    this.held = false;
  }
}

export function createDefaultKeys(): Array<KeyViewModel> {
  const whiteKeys = new Array<KeyViewModel>(),
        blackKeys = new Array<KeyViewModel>();
  let xOffset = 0;
  for (let i = layout.keyStart; i < layout.keyEnd; i++) {
    const key = new KeyViewModel(i, xOffset);
    if (key.black) {
      blackKeys.push(key);
    } else {
      whiteKeys.push(key);
    }
    if (!key.black) {
      xOffset += key.width;
    }
  }
  return [...whiteKeys, ...blackKeys];
}

export class KeysViewModel {
  private _numVisibleKeys = 7;
  keys: Array<KeyViewModel>;
  viewBox: Array<number> = [0, 0, 0, 0];

  constructor() {
    this.keys = createDefaultKeys();
  }

  resetKeyState(): void {
    for (const key of this.keys) {
      key.resetState();
    }
  }

  set numVisibleKeys(num: number) {
    this._numVisibleKeys = num;
    this.viewBox = this.calcViewBox();
  }

  get numVisibleKeys(): number {
    return this._numVisibleKeys;
  }

  private calcViewBox(): Array<number> {
    const w = this._numVisibleKeys * layout.whiteKeyWidth;
    return [0, 0, w, layout.keyboardHeight];
  }
}
