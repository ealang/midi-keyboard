import { EventEmitter } from '@angular/core';

import { Point } from '../geometry';
import { ControlsService } from '../controls/controls.service';
import { WebMidiService } from '../webmidi.service';
import { KeypressEvent, KeypressEventType } from '../keypress/keypress.service';
import { MidiCommand } from './mods/midi-command';
import { PlayService } from './play.service';

class MockWebMidiService extends WebMidiService {
  deviceOpened = new EventEmitter<void>();
  preDeviceClose = new EventEmitter<void>();
  sendData(data: Array<Array<number>>): void {}
}

function indexWhere<T>(list: T[], predicate: (t: T) => boolean): number {
  for (let i = 0; i < list.length; i++) {
    if (predicate(list[i])) {
      return i;
    }
  }
  return null;
}

describe('PlayService', () => {
  let midi: MockWebMidiService;

  const defaultConfig = () => new ControlsService();
  const fixedVelConfig = () => {
    const cfg = new ControlsService();
    cfg.velocityMode.value = 'fixed';
    return cfg;
  };
  const yModVelConfig = () => {
    const cfg = new ControlsService();
    cfg.velocityMode.value = 'ymod';
    return cfg;
  };
  const yModPressureConfig = () => {
    const cfg = new ControlsService();
    cfg.yModMode.value = 'pressure';
    return cfg;
  };
  const roundRobinChConfig = () => {
    const cfg = new ControlsService();
    cfg.channelMode.value = 'round-robin';
    return cfg;
  };
  const pitchBendXModConfig = () => {
    const cfg = new ControlsService();
    cfg.xSlideMode.value = 'channel-pitch-bend';
    cfg.xSlideDeadZone.value = 0;
    cfg.xSlidePitchBendSemi.value = 1;
    return cfg;
  };

  const evt = (eventType: KeypressEventType, pt: Point = {x: 0, y: 0}) => {
    return new KeypressEvent(eventType, 12, pt);
  };

  const withInst = (controlsFactory: () => ControlsService, body: (service: PlayService, controls?: ControlsService) => void) => {
    return () => {
      const controls = controlsFactory();
      const service = new PlayService(midi, controls);
      expect(midi.sendData).not.toHaveBeenCalled();
      body(service, controls);
    };
  };

  beforeEach(() => {
    midi = new MockWebMidiService();
    spyOn(midi, 'sendData');
  });

  describe('note events', () => {
    it('should send note events with fixed velocity', withInst(fixedVelConfig, (play: PlayService, controls: ControlsService) => {
      controls.velocityFixedValue.value = 0x44;
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOn(0, 12, 0x44)
      );

      controls.velocityFixedValue.value = 0x45;
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOff(0, 12, 0x45)
      );
    }));

    it('should send note events with ymod velocity (non-inverted)',
      withInst(yModVelConfig, (play: PlayService, controls: ControlsService) => {

      controls.velocityYModInvert.value = false;

      play.processEvent(evt(KeypressEventType.Down, {x: 0, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOn(0, 12, 0)
      );

      play.processEvent(evt(KeypressEventType.Up, {x: 0, y: 1}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOff(0, 12, 0x7F)
      );
    }));

    it('should send note events with ymod velocity (inverted)',
      withInst(yModVelConfig, (play: PlayService, controls: ControlsService) => {

      controls.velocityYModInvert.value = true;

      play.processEvent(evt(KeypressEventType.Down, {x: 0, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOn(0, 12, 0x7F)
      );

      play.processEvent(evt(KeypressEventType.Up, {x: 0, y: 1}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.noteOff(0, 12, 0)
      );
    }));
  });

  describe('xslide channel pitch', () => {
    it('initializes lazily', withInst(pitchBendXModConfig, (play: PlayService) => {
      expect(midi.sendData).not.toHaveBeenCalled();
    }));

    it('should send pitch bend events as touch moves', withInst(pitchBendXModConfig, (play: PlayService) => {
      const pitchBend = MidiCommand.pitchBendNorm(0, 1.0),
            pitchBendReset = MidiCommand.pitchBendReset(0);
      play.processEvent(evt(KeypressEventType.Down));
      play.processEvent(evt(KeypressEventType.Move, {x: 0, y: 0}));
      play.processEvent(evt(KeypressEventType.Move, {x: 1, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBend);
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendReset);
    }));

    it('updates when sensitivity is changed', withInst(pitchBendXModConfig, (play: PlayService, controls: ControlsService) => {
      controls.xSlidePitchBendSemi.value = 3;
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.pitchBendSensitivity(0, 3)
      );
      play.processEvent(evt(KeypressEventType.Up));

      controls.xSlidePitchBendSemi.value = 6;
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.pitchBendSensitivity(0, 6)
      );
    }));

    it('initializes new channels', withInst(pitchBendXModConfig, (play: PlayService, controls: ControlsService) => {
      const pitchBendRangeCh0 = MidiCommand.pitchBendSensitivity(0, controls.xSlidePitchBendSemi.value);
      const pitchBendRangeCh1 = MidiCommand.pitchBendSensitivity(1, controls.xSlidePitchBendSemi.value);
      controls.channelFixedChannel.value = 0;
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRangeCh0);
      play.processEvent(evt(KeypressEventType.Up));

      controls.channelFixedChannel.value = 1;
      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRangeCh1);
    }));

    it('initializes new devices', withInst(pitchBendXModConfig, (play: PlayService, controls: ControlsService) => {
      const pitchBendRange = MidiCommand.pitchBendSensitivity(0, controls.xSlidePitchBendSemi.value);
      controls.channelFixedChannel.value = 0;

      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRange);
      play.processEvent(evt(KeypressEventType.Up));

      midi.sendData['calls'].reset();
      midi.deviceOpened.emit();

      play.processEvent(evt(KeypressEventType.Down));
      expect(midi.sendData).toHaveBeenCalledWith(pitchBendRange);
    }));
  });

  describe('channel modes', () => {
    const noteOnCh0 = MidiCommand.noteOn(0, 12, 0x7F),
          noteOffCh0 = MidiCommand.noteOff(0, 12, 0x7F),
          noteOnCh1 = MidiCommand.noteOn(1, 12, 0x7F),
          noteOffCh1 = MidiCommand.noteOff(1, 12, 0x7F),
          noteOnCh5 = MidiCommand.noteOn(5, 12, 0x7F),
          noteOffCh5 = MidiCommand.noteOff(5, 12, 0x7F);

    it('can send notes on a fixed channel', withInst(defaultConfig, (play: PlayService, controls: ControlsService) => {
      controls.channelFixedChannel.value = 0;
      play.processEvent(evt(KeypressEventType.Down));
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(noteOnCh0);
      expect(midi.sendData).toHaveBeenCalledWith(noteOffCh0);

      controls.channelFixedChannel.value = 1;
      play.processEvent(evt(KeypressEventType.Down));
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(noteOnCh1);
      expect(midi.sendData).toHaveBeenCalledWith(noteOffCh1);
    }));

    it('can send notes using round-robin channels', withInst(roundRobinChConfig, (play: PlayService, controls: ControlsService) => {
      play.processEvent(evt(KeypressEventType.Down));
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(noteOnCh0);
      expect(midi.sendData).toHaveBeenCalledWith(noteOffCh0);

      play.processEvent(evt(KeypressEventType.Down));
      play.processEvent(evt(KeypressEventType.Up));
      expect(midi.sendData).toHaveBeenCalledWith(noteOnCh1);
      expect(midi.sendData).toHaveBeenCalledWith(noteOffCh1);
    }));
  });

  describe('ymod polyphonic pressure', () => {
    it('should send pressure events as touch moves (non-inverted)',
      withInst(yModPressureConfig, (play: PlayService, controls: ControlsService) => {

      controls.yModYInvert.value = false;

      play.processEvent(evt(KeypressEventType.Down, {x: 0, y: 1}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.polyphonicKeyPressure(0, 12, 0x7F)
      );

      play.processEvent(evt(KeypressEventType.Move, {x: 0, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.polyphonicKeyPressure(0, 12, 0x0)
      );
    }));

    it('should send pressure events as touch moves (inverted)',
      withInst(yModPressureConfig, (play: PlayService, controls: ControlsService) => {

      controls.yModYInvert.value = true;

      play.processEvent(evt(KeypressEventType.Down, {x: 0, y: 1}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.polyphonicKeyPressure(0, 12, 0x0)
      );

      play.processEvent(evt(KeypressEventType.Move, {x: 0, y: 0}));
      expect(midi.sendData).toHaveBeenCalledWith(
        MidiCommand.polyphonicKeyPressure(0, 12, 0x7F)
      );
    }));

    it('should send pressure commands after note on commands',
      withInst(yModPressureConfig, (play: PlayService, controls: ControlsService) => {

      play.processEvent(evt(KeypressEventType.Down, {x: 0, y: 1}));
      const commands = midi.sendData['calls'].allArgs().map(args => args[0]);

      const noteOnIndex = indexWhere(commands, (command) => {
        return command[0][0] === 0x90;
      });
      const pressureIndex = indexWhere(commands, (command) => {
        return command[0][0] === 0xA0;
      });
      expect(pressureIndex).toBeGreaterThan(noteOnIndex);
    }));
  });
});
