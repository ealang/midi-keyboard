import { Injectable, EventEmitter } from '@angular/core';

import { KeyConfigService } from '../keyconfig.service';

@Injectable()
export class ControlsService {
  readonly minVelocity = 1;
  readonly maxVelocity = 127;
  velocity = 127;

  readonly minVisibleKeys = 3;
  readonly maxVisibleKeys: number;
  numVisibleKeys = 12;

  channel = 0;

  yMod = 'disabled';

  numKeyboards = 1;

  minikeys = false;

  constructor(keyconfig: KeyConfigService) {
    this.maxVisibleKeys = keyconfig.numWhiteKeys;
  }
}
