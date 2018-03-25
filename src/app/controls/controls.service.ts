import { Injectable } from '@angular/core';

import { ConfigItem } from './config-item';
import { KeyConfigService } from '../keyconfig.service';

const midiMin = 1;
const midiMax = 127;

@Injectable()
export class ControlsService {
  readonly midiMin = midiMin;
  readonly midiMax = midiMax;

  readonly minVisibleKeys = 3;
  readonly maxVisibleKeys: number;
  numVisibleKeys = 7;
  numKeyboards = 1;
  minikeys = false;

  readonly velocity = {
    mode: new ConfigItem<string>('fixed'),
    fixedValue: midiMax,
    yModInvert: false
  };

  readonly yMod = {
    mode: new ConfigItem<string>('disabled'),
    yInvert: true
  };

  readonly xSlideMod = {
    mode: new ConfigItem<string>('disabled'),
    deadZone: 0.1,
    minPitchBendSemi: 1,
    maxPitchBendSemi: 12,
    pitchBendSemi: new ConfigItem<number>(2)
  };

  readonly guiMinXSlideDeadZone: 0;
  readonly guiMaxXSlideDeadZone: 40;
  get guiXSlideDeadZone(): number {
    return Math.floor(this.xSlideMod.deadZone * 100);
  }
  set guiXSlideDeadZone(val: number) {
    this.xSlideMod.deadZone = val / 100;
  }

  readonly channel = {
    mode: new ConfigItem<string>('fixed'),
    fixedChannel: new ConfigItem<number>(0)
  };

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }
}
