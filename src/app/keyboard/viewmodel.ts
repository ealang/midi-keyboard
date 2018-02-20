const numKeys = 88,
      keyStart = 21,
      keyEnd = keyStart + numKeys,
      layout = (function() {
                 const keySize = 18,
                       keyBorderWidth = 2,
                       whiteKeyWidth = keySize,
                       blackKeyWidth = keySize / 2,
                       whiteKeyHeight = keySize * 2,
                       blackKeyHeight = keySize * 4 / 3,
                       keyboardOffset = keyBorderWidth / 2,
                       keyboardHeight = whiteKeyHeight + keyBorderWidth;
                 return {
                   keyBorderWidth,
                   whiteKeyWidth,
                   blackKeyWidth,
                   whiteKeyHeight,
                   blackKeyHeight,
                   keyboardOffset,
                   keyboardHeight
                 };
               })();

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
  for (let i = keyStart; i < keyEnd; i++) {
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

export class KeyboardViewModel {
  private viewPos = 0;
  private numVisibleKeys = 7;
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

  setNumVisibleKeys(num: number): void {
    this.numVisibleKeys = num;
    this.viewBox = this.calcViewBox();
  }

  setViewPosition(pos: number): void {
    this.viewPos = pos;
    this.viewBox = this.calcViewBox();
  }

  private calcViewBox(): Array<number> {
    const x = this.viewPos * layout.whiteKeyWidth,
          w = this.numVisibleKeys * layout.whiteKeyWidth;
    return [x, 0, w, layout.keyboardHeight];
  }
}
