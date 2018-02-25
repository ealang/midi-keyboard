import { Injectable } from '@angular/core';

@Injectable()
export class LayoutService {
  readonly keyBorderWidth: number;
  readonly whiteKeyWidth: number;
  readonly blackKeyWidth: number;
  readonly whiteKeyHeight: number;
  readonly blackKeyHeight: number;
  readonly keyboardOffset: number;
  readonly keyboardHeight: number;
  readonly dragBarHeight: number;
  readonly labelFontSize: number;

  constructor() {
    const keySize = 18;
    this.keyBorderWidth = 2;
    this.whiteKeyWidth = keySize;
    this.blackKeyWidth = keySize * 2 / 3;
    this.whiteKeyHeight = keySize * 5;
    this.blackKeyHeight = keySize * 5 / 2;
    this.keyboardOffset = this.keyBorderWidth / 2;
    this.dragBarHeight = keySize;
    this.keyboardHeight = this.whiteKeyHeight + this.keyBorderWidth + this.dragBarHeight;
    this.labelFontSize = keySize / 3;
  }
}
