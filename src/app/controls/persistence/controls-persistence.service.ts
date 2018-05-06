import 'reflect-metadata';
import { Injectable } from '@angular/core';

import { ConfigItem } from '../config-item';
import { ControlsService } from '../controls.service';
import { LocalStorageService } from './local-storage.service';
import { metadataKey } from './persist-decorator';

export interface Storage {
  dataVersion: string;
  data: {
    [key: string]: any
  };
}

@Injectable()
export class ControlsPersistenceService {
  static readonly curDataVersion = '0';
  static readonly localStorageKey = 'settings';

  private static loadData(localStorage: LocalStorageService): Storage {
    const loaded = localStorage.getItem<Storage>(
      ControlsPersistenceService.localStorageKey
    );

    if (loaded && loaded.dataVersion === ControlsPersistenceService.curDataVersion) {
      return loaded;
    } else {
      return {
        dataVersion: ControlsPersistenceService.curDataVersion,
        data: {}
      };
    }
  }

  static restoreControlsService(localStorage: LocalStorageService): ControlsService {
    const inst = new ControlsService();
    const storage = ControlsPersistenceService.loadData(localStorage);

    for (const key in storage.data) {
      if (storage.data.hasOwnProperty(key)) {
        inst[key].value = storage.data[key];
      }
    }
    return inst;
  }

  private saveData(storage: Storage): void {
    this.localStorage.setItem(
      ControlsPersistenceService.localStorageKey,
      storage
    );
  }

  constructor(
    controls: ControlsService,
    private localStorage: LocalStorageService
  ) {
    const propertyNames = Reflect.getMetadata(metadataKey, controls) || [];
    const storage: Storage = ControlsPersistenceService.loadData(localStorage);
    propertyNames.forEach(name => {
      const item = controls[name] as ConfigItem<any>;
      item.change.subscribe(value => {
        storage.data[name] = value;
        this.saveData(storage);
      });
    });
  }
}

