import { Injectable, EventEmitter } from '@angular/core';

import { KeyConfigService } from '../keyconfig.service';

@Injectable()
export class ControlsService {
  readonly minVelocity = 1;
  readonly maxVelocity = 127;
  velocity = 127;

  readonly minVisibleKeys = 3;
  readonly maxVisibleKeys: number;
  numVisibleKeys = 7;

  private channel_ = 0;
  get channel(): number {
    return this.channel_;
  }
  set channel(newChannel: number) {
    const oldChannel = this.channel_;
    this.channel_ = newChannel;
    this.channelChange.emit([oldChannel, newChannel]);
  }
  channelChange = new EventEmitter<[number, number]>();

  yMod = 'disabled';
  xSlideMod = 'disabled';

  xSlideDeadZone = 0.1;
  readonly guiMinXSlideDeadZone = 0;
  readonly guiMaxXSlideDeadZone = 40;
  get guiXSlideDeadZone(): number {
    return Math.floor(this.xSlideDeadZone * 100);
  }
  set guiXSlideDeadZone(val: number) {
    this.xSlideDeadZone = val / 100;
  }

  readonly minPitchBendSemi = 1;
  readonly maxPitchBendSemi = 12;
  pitchBendSemi_ = 2;
  get pitchBendSemi() {
    return this.pitchBendSemi_;
  }
  set pitchBendSemi(val: number) {
    this.pitchBendSemi_ = val;
    this.pitchBendSemiChange.emit(val);
  }
  pitchBendSemiChange = new EventEmitter<number>();

  numKeyboards = 1;

  minikeys = false;

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }
}
