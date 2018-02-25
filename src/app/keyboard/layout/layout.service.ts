import { Injectable } from '@angular/core';

const keySize = 16,
      keyBorderWidth = 1,
      whiteKeyWidth = keySize,
      blackKeyWidth = keySize * 2 / 3,
      whiteKeyHeight = keySize * 4.5,
      blackKeyHeight = keySize * 5 / 2,
      keyboardOffset = keyBorderWidth / 2,
      dragBarHeight = keySize,
      dragBarBorderWidth = 1,
      keyboardHeight = whiteKeyHeight + keyBorderWidth + dragBarHeight + dragBarBorderWidth,
      labelFontSize = keySize / 4;

@Injectable()
export class LayoutService {
  readonly keyBorderWidth = keyBorderWidth;
  readonly whiteKeyWidth = whiteKeyWidth;
  readonly blackKeyWidth = blackKeyWidth;
  readonly whiteKeyHeight = whiteKeyHeight;
  readonly blackKeyHeight = blackKeyHeight;
  readonly keyboardOffset = keyboardOffset;
  readonly keyboardHeight = keyboardHeight;
  readonly dragBarHeight = dragBarHeight;
  readonly dragBarBorderWidth = dragBarBorderWidth;
  readonly labelFontSize = labelFontSize;
}
