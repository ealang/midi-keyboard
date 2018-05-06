import { Injectable } from '@angular/core';
import { ConfigItem } from './config-item';
import { persist } from './persistence/persist-decorator';

const midiMin = 1;
const midiMax = 127;

@Injectable()
export class ControlsService {
  readonly midiMin = midiMin;
  readonly midiMax = midiMax;

  @persist()
  numVisibleKeys = new ConfigItem<number>(7);
  @persist()
  numKeyboards = new ConfigItem<number>(1);
  @persist()
  minikeys = new ConfigItem<boolean>(false);

  @persist()
  velocityMode = new ConfigItem<string>('fixed');
  @persist()
  velocityFixedValue = new ConfigItem<number>(midiMax);
  @persist()
  velocityYModInvert = new ConfigItem<boolean>(false);

  @persist()
  yModMode = new ConfigItem<string>('disabled');
  @persist()
  yModYInvert = new ConfigItem<boolean>(true);

  @persist()
  xSlideMode = new ConfigItem<string>('disabled');
  @persist()
  xSlideDeadZone = new ConfigItem<number>(0.1);
  @persist()
  xSlideMinPitchBendSemi = new ConfigItem<number>(1);
  @persist()
  xSlideMaxPitchBendSemi = new ConfigItem<number>(12);
  @persist()
  xSlidePitchBendSemi = new ConfigItem<number>(2);

  readonly guiMinXSlideDeadZone = 0;
  readonly guiMaxXSlideDeadZone = 40;
  get guiXSlideDeadZone(): number {
    return Math.floor(this.xSlideDeadZone.value * 100);
  }
  set guiXSlideDeadZone(val: number) {
    this.xSlideDeadZone.value = val / 100;
  }

  @persist()
  channelMode = new ConfigItem<string>('fixed');
  @persist()
  channelFixedChannel = new ConfigItem<number>(0);
}
