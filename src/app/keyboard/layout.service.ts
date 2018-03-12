import { Injectable } from '@angular/core';
import { KeyConfigService } from '../keyconfig.service';

const keySize = 16,
      keyStrokeWidth = 1,
      whiteKeyWidth = keySize,
      blackKeyWidth = keySize * 13.7 / 23.5,
      dragBarHeight = keySize * 4 / 9,
      keyBoardPadding = 0,
      dragBarStrokeWidth = 1,
      labelFontSize = keySize / 4;

@Injectable()
export class LayoutService {
  readonly keyStrokeWidth = keyStrokeWidth;
  readonly whiteKeyWidth = whiteKeyWidth;
  readonly blackKeyWidth = blackKeyWidth;
  readonly keyBoardPadding = keyBoardPadding;
  readonly dragBarWidth: number;
  readonly dragBarHeight = dragBarHeight;
  readonly dragBarStrokeWidth = dragBarStrokeWidth;
  readonly labelFontSize = labelFontSize;

  whiteKeyHeight(minikeys: boolean): number {
    return keySize * (minikeys ? 3 : 5);
  }

  blackKeyHeight(minikeys: boolean): number {
    return keySize * (minikeys ? 3 : 5) / 2;
  }

  constructor(keyconfig: KeyConfigService) {
    this.dragBarWidth = keyconfig.numWhiteKeys * whiteKeyWidth + dragBarStrokeWidth;
  }
}
