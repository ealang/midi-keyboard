function isBlackKey(keyNumber: number): boolean {
  const i = keyNumber % 12;
  return i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
}

function numKeysToDisplay(keyStart: number, keySizePxl: number, widthAvailPxl: number): number {
  const nKeys = Math.trunc(widthAvailPxl / keySizePxl * 12 / 7) - 2;
  return isBlackKey(keyStart + nKeys - 1) ? nKeys - 1 : nKeys;
}

export class KeyViewModel {
  readonly black: boolean;
  readonly keyNumber: number;
  held: boolean;
  width: string;
  height: string;
  marginLeft: string;
  borderWidth: string;
  borderLeftWidth: string;
  borderRightWidth: string;

  constructor(keyNumber: number, startNumber: number, endNumber: number, keySize: number) {
    this.keyNumber = keyNumber;
    this.black = isBlackKey(keyNumber);
    this.held = false;

    const border = 8 / 120 * keySize;
    let w, h, marginLeft;
    if (this.black) {
      w = Math.trunc(keySize / 2);
      h = Math.trunc(keySize * 4 / 3);
      marginLeft = -border - w / 2;
    } else {
      w = keySize;
      h = keySize * 2;
      marginLeft = 0;
    }
    this.width = Math.trunc(w) + 'px';
    this.height = Math.trunc(h) + 'px';
    this.marginLeft = Math.trunc(marginLeft) + 'px';

    const firstKey = this.keyNumber === startNumber,
          lastKey = this.keyNumber === endNumber - 1 || (this.keyNumber + 1 === endNumber - 1 && isBlackKey(this.keyNumber + 1));

    let borderLeftWidth, borderRightWidth;
    if (this.black) {
      borderLeftWidth = border;
      borderRightWidth = border;
    } else {
      borderLeftWidth = border / 2;
      borderRightWidth = border / 2;
      if (lastKey && !this.black) {
        borderRightWidth = border;
      } else if (firstKey && !this.black) {
        borderLeftWidth = border;
      }
    }
    this.borderLeftWidth = Math.trunc(borderLeftWidth) + 'px';
    this.borderRightWidth = Math.trunc(borderRightWidth) + 'px';
    this.borderWidth = Math.trunc(border) + 'px';
  }
}

export function createKeysViewModel(keyStart: number, keySizePxl: number, widthAvailPxl: number): Array<KeyViewModel> {
  const adjKeyStart = isBlackKey(keyStart) ? keyStart - 1 : keyStart,
        nKeys = numKeysToDisplay(adjKeyStart, keySizePxl, widthAvailPxl),
        adjKeyEnd = adjKeyStart + nKeys,
        keys = new Array<KeyViewModel>();

  for (let i = adjKeyStart; i < adjKeyEnd; i++) {
    keys.push(new KeyViewModel(i, adjKeyStart, adjKeyEnd, keySizePxl));
  }
  return keys;
}
