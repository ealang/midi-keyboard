import { Injectable } from '@angular/core';
import { ConfigItem } from './config-item';

const midiMin = 1;
const midiMax = 127;

@Injectable()
export class ControlsService {
  readonly midiMin = midiMin;
  readonly midiMax = midiMax;

  numVisibleKeys = new ConfigItem<number>(7);
  numKeyboards = new ConfigItem<number>(1);
  minikeys = new ConfigItem<boolean>(false);

  velocityMode = new ConfigItem<string>('fixed');
  velocityFixedValue = new ConfigItem<number>(midiMax);
  velocityYModInvert = new ConfigItem<boolean>(false);

  yModMode = new ConfigItem<string>('disabled');
  yModYInvert = new ConfigItem<boolean>(true);

  xSlideMode = new ConfigItem<string>('disabled');
  xSlideDeadZone = new ConfigItem<number>(0.1);
  xSlideMinPitchBendSemi = new ConfigItem<number>(1);
  xSlideMaxPitchBendSemi = new ConfigItem<number>(12);
  xSlidePitchBendSemi = new ConfigItem<number>(2);

  readonly guiMinXSlideDeadZone = 0;
  readonly guiMaxXSlideDeadZone = 40;
  get guiXSlideDeadZone(): number {
    return Math.floor(this.xSlideDeadZone.value * 100);
  }
  set guiXSlideDeadZone(val: number) {
    this.xSlideDeadZone.value = val / 100;
  }

  channelMode = new ConfigItem<string>('fixed');
  channelFixedChannel = new ConfigItem<number>(0);
}
