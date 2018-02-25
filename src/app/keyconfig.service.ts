import { Injectable } from '@angular/core';

const keyStart = 21,
      numKeys = 88,
      keyEnd = keyStart + numKeys,
      numWhiteKeys = 52;

@Injectable()
export class KeyConfigService {
  readonly keyStart = keyStart;
  readonly keyEnd = keyEnd;
  readonly numKeys = numKeys;
  readonly numWhiteKeys = numWhiteKeys;
}
