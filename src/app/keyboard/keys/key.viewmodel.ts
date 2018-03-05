import { LayoutService } from '../layout/layout.service';
import { KeyConfigService } from '../../keyconfig.service';

function isBlackKey(keyNumber: number): boolean {
  const i = keyNumber % 12;
  return i === 1 || i === 3 || i === 6 || i === 8 || i === 10;
}

export class KeyViewModel {
  private static readonly midiKeyOctave0 = 12;
  private static readonly keyLabels = ['C', '', 'D', '', 'E', 'F', '', 'G', '', 'A', '', 'B'];

  readonly black: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly strokeWidth: number;
  readonly label: string;

  held: boolean;

  constructor(readonly keyNumber: number, xOffset: number, layout: LayoutService) {
    this.black = isBlackKey(keyNumber);
    this.x = xOffset + (this.black ? -layout.blackKeyWidth / 2 : 0);
    this.y = 0;
    this.width = this.black ? layout.blackKeyWidth : layout.whiteKeyWidth;
    this.height = this.black ? layout.blackKeyHeight : layout.whiteKeyHeight;
    this.strokeWidth = layout.keyStrokeWidth;
    this.resetState();

    const octave = Math.floor((keyNumber - KeyViewModel.midiKeyOctave0) / 12);
    this.label = KeyViewModel.keyLabels[keyNumber % 12] + octave;
  }

  resetState(): void {
    this.held = false;
  }
}

export function createDefaultKeys(layout: LayoutService, keyconfig: KeyConfigService): Array<KeyViewModel> {
  const whiteKeys = new Array<KeyViewModel>(),
        blackKeys = new Array<KeyViewModel>();
  let xOffset = 0;
  for (let i = keyconfig.keyStart; i < keyconfig.keyEnd; i++) {
    const key = new KeyViewModel(i, xOffset, layout);
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
