import { ControlsService } from '../controls.service';
import { LocalStorageService } from './local-storage.service';
import { ControlsPersistenceService, Storage } from './controls-persistence.service';

describe('ControlsPersistenceService', () => {
  let controls: ControlsService;
  let localStorage: LocalStorageService;

  beforeEach(() => {
    controls = new ControlsService();
    localStorage = new class {
      private data = new Map<string, any>();
      setItem(key: string, value: any): void {
        this.data.set(key, JSON.stringify(value));
      }
      getItem<T>(key: string): T {
        return this.data.has(key) && JSON.parse(this.data.get(key)) as T;
      }
    };
  });

  describe('when clean slate', () => {
    let persistence: ControlsPersistenceService;

    beforeEach(() => {
      persistence = new ControlsPersistenceService(controls, localStorage);
    });

    it('should write the data format version to storage', () => {
      controls.velocityMode.value = 'new-value';
      expect(localStorage.getItem<Storage>(ControlsPersistenceService.localStorageKey).dataVersion)
        .toEqual('0');
    });

    it('should write settings that change to local storage', () => {
      controls.velocityMode.value = 'new-value';
      expect(localStorage.getItem<Storage>(ControlsPersistenceService.localStorageKey).data)
        .toEqual({ velocityMode: 'new-value' });
    });

    it('should restore controls from local storage', () => {
      controls.velocityMode.value = 'new-value';

      const controls2 = ControlsPersistenceService.restoreControlsService(localStorage);
      expect(controls2.velocityMode.value).toEqual('new-value');
    });
  });

  describe('when has pre-existing data', () => {
    it('should preserve data when version is known', () => {
      localStorage.setItem(ControlsPersistenceService.localStorageKey, {
        dataVersion: ControlsPersistenceService.curDataVersion,
        data: {
          'something': 'value'
        }
      });

      const persistence = new ControlsPersistenceService(controls, localStorage);
      controls.numKeyboards.value = 10;

      expect(localStorage.getItem<Storage>(ControlsPersistenceService.localStorageKey).data)
        .toEqual({
          numKeyboards: 10,
          something: 'value'
        });
    });

    it('should override data if version is unknown', () => {
      localStorage.setItem(ControlsPersistenceService.localStorageKey, {
        dataVersion: 'invalid-version',
        data: {
          'something': 'value'
        }
      });

      const persistence = new ControlsPersistenceService(controls, localStorage);
      controls.numKeyboards.value = 10;

      expect(localStorage.getItem<Storage>(ControlsPersistenceService.localStorageKey))
        .toEqual({
          data: {
            numKeyboards: 10
          },
          dataVersion: ControlsPersistenceService.curDataVersion
        });
    });
  });
});
