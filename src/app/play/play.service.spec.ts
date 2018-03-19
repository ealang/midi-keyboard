import { Point } from '../geometry';
import { EventEmitter } from '@angular/core';
import { PlayService } from './play.service';
import { ControlsService } from '../controls/controls.service';
import { WebMidiService } from '../webmidi.service';
import { KeyConfigService } from '../keyconfig.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';
import { MidiCommand } from './midi-command';

class MockWebMidiService extends WebMidiService {
  deviceOpened = new EventEmitter<void>();
  preDeviceClose = new EventEmitter<void>();
  sendData(data: Array<Array<number>>): void {}
}

describe('PlayService', () => {
  let midi: MockWebMidiService;

  const keyconfig = new KeyConfigService();
  const defaultConfig = new ControlsService(keyconfig);
  const pitchBendXMod = (() => {
    const cfg = new ControlsService(keyconfig);
    cfg.xSlideMod = 'channel-pitch-bend';
    cfg.xSlideDeadZone = 0;
    cfg.pitchBendSemi = 1;
    return cfg;
  })();

  const evt = (eventType: KeypressEventType, pt: Point = {x: 0, y: 0}) => {
    return new KeypressEvent(eventType, 12, pt);
  };

  const withInst = (controls: ControlsService, body: (service: PlayService) => void) => {
    return () => {
      body(new PlayService(midi, controls));
    };
  };

  beforeEach(() => {
    midi = new MockWebMidiService();
    spyOn(midi, 'sendData');
    expect(midi.sendData).not.toHaveBeenCalled();
  });

  describe('basic mode', () => {
    it('should send note on/off events', withInst(defaultConfig, (play: PlayService) => {
      const noteOn = MidiCommand.noteOn(0, 12, 0x7F),
            noteOff = MidiCommand.noteOff(0, 12, 0x7F);
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(noteOn);
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(noteOff);
    }));
  });

  describe('environment events', () => {
    it('initializes new devices', withInst(defaultConfig, (play: PlayService) => {
      const pitchBendRange = MidiCommand.pitchBendSensitivity(0, defaultConfig.pitchBendSemi);
      midi.deviceOpened.emit();
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRange);
    }));

    it('initializes new channels', withInst(defaultConfig, (play: PlayService) => {
      const pitchBendRange = MidiCommand.pitchBendSensitivity(1, defaultConfig.pitchBendSemi);
      defaultConfig.channel = 1;
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRange);
    }));
  });

  describe('xmod controls', () => {
    it('should send pitch bend events', withInst(pitchBendXMod, (play: PlayService) => {
      const noteOn = MidiCommand.noteOn(0, 12, 0x7F),
            pitchBend = MidiCommand.pitchBendNorm(0, 1.0),
            pitchBendReset = MidiCommand.pitchBendReset(0),
            noteOff = MidiCommand.noteOff(0, 12, 0x7F);
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(noteOn);
      play.processEvent(evt(KeypressEventType.Move, {x: 0, y: 0}));
      play.processEvent(evt(KeypressEventType.Move, {x: 1, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBend);
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith([...pitchBendReset, ...noteOff]);
    }));
  });
});
