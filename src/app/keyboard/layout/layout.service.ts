import { Injectable } from '@angular/core';
import { KeyConfigService } from '../../keyconfig.service';

const keySize = 16,
      keyBorderWidth = 1,
      whiteKeyWidth = keySize,
      blackKeyWidth = keySize * 2 / 3,
      whiteKeyHeight = keySize * 5,
      blackKeyHeight = keySize * 5 / 2,
      dragBarHeight = keySize / 5,
      keyBoardPadding = keySize / 4,
      dragBarStrokeWidth = 1,
      labelFontSize = keySize / 4;

@Injectable()
export class LayoutService {
  readonly keyBorderWidth = keyBorderWidth;
  readonly whiteKeyWidth = whiteKeyWidth;
  readonly blackKeyWidth = blackKeyWidth;
  readonly whiteKeyHeight = whiteKeyHeight;
  readonly blackKeyHeight = blackKeyHeight;
  readonly keyBoardPadding = keyBoardPadding;
  readonly dragBarWidth: number;
  readonly dragBarHeight = dragBarHeight;
  readonly dragBarStrokeWidth = dragBarStrokeWidth;
  readonly labelFontSize = labelFontSize;

  constructor(keyconfig: KeyConfigService) {
    this.dragBarWidth = keyconfig.numWhiteKeys * whiteKeyWidth + dragBarStrokeWidth;
  }
}
