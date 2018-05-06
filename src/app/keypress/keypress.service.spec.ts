import { KeypressService, KeypressEvent, KeypressEventType } from './keypress.service';
import { ControlsService } from '../controls/controls.service';

describe('KeypressService', () => {
  let inst: KeypressService,
      downEvents: Array<number>,
      moveEvents: Array<number>,
      upEvents: Array<number>,
      controls: ControlsService;

  const dummyPt = {x: 0, y: 0};

  beforeEach(() => {
    downEvents = [];
    moveEvents = [];
    upEvents = [];
    controls = new ControlsService();
    inst = new KeypressService(controls);
    inst.keypressEvent.subscribe((e) => {
      if (e.eventType === KeypressEventType.Down) {
        downEvents.push(e.keyNumber);
      } else if (e.eventType === KeypressEventType.Up) {
        upEvents.push(e.keyNumber);
      } else if (e.eventType === KeypressEventType.Move) {
        moveEvents.push(e.keyNumber);
      }
    });
  });

  it('should not play key if touch began off keyboard and later moves onto keyboard', () => {
    const id1 = '1';
    // touch down off keyboard
    inst.emitEvent(id1, null, 'start', dummyPt);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
    // move onto key
    inst.emitEvent(id1, 33, 'move', dummyPt);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
    // release
    inst.emitEvent(id1, 33, 'end', dummyPt);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
  });

  it('should keep key held even if touch moves off keyboard', () => {
    const id1 = '1';
    // push down a key
    inst.emitEvent(id1, 33, 'start', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // move off keyboard
    inst.emitEvent(id1, null, 'move', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // release touch
    inst.emitEvent(id1, null, 'end', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([33]);
  });

  it('should not allow key to be pressed if already pressed', () => {
    const id1 = '1', id2 = '2';
    // id1: push down a key
    inst.emitEvent(id1, 33, 'start', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id2: push down same key
    inst.emitEvent(id2, 33, 'start', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id1: release
    inst.emitEvent(id1, 33, 'end', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id2: release
    inst.emitEvent(id2, 33, 'end', dummyPt);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([33]);
  });

  it('should send off event for old key if id is re-used to play a new key without releasing old key', () => {
    const id1 = '1';
    inst.emitEvent(id1, 32, 'start', dummyPt);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.emitEvent(id1, 30, 'start', dummyPt);
    expect(downEvents).toEqual([32, 30]);
    expect(upEvents).toEqual([32]);
    inst.emitEvent(id1, 28, 'end', dummyPt);
    expect(downEvents).toEqual([32, 30]);
    expect(upEvents).toEqual([32, 30]);
  });

  it('should ignore further movement if touches are marked frozen', () => {
    const id1 = '1';
    inst.emitEvent(id1, 32, 'start', dummyPt);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.freezeAll();
    inst.emitEvent(id1, 33, 'move', dummyPt);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.emitEvent(id1, 33, 'end', dummyPt);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([32]);
  });

  it('should unfreeze touch after key is lifted', () => {
    const id1 = '1';
    // 1st action
    inst.emitEvent(id1, 32, 'start', dummyPt);
    inst.freezeAll();
    inst.emitEvent(id1, 33, 'move', dummyPt);
    inst.emitEvent(id1, 33, 'end', dummyPt);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([32]);

    // 2nd action
    inst.emitEvent(id1, 34, 'start', dummyPt);
    inst.emitEvent(id1, 35, 'move', dummyPt);
    inst.freezeAll();
    expect(downEvents).toEqual([32, 34, 35]);
    expect(upEvents).toEqual([32, 34]);
  });

  describe('travel mode', () => {
    beforeEach(() => {
      controls.stickyTouch.value = false;
    });

    it('should send events for each key touch moves across', () => {
      const id1 = '1';
      // push down a key
      inst.emitEvent(id1, 33, 'start', dummyPt);
      expect(downEvents).toEqual([33]);
      expect(upEvents).toEqual([]);
      // move to another key
      inst.emitEvent(id1, 32, 'move', dummyPt);
      expect(downEvents).toEqual([33, 32]);
      expect(upEvents).toEqual([33]);
      // release key
      inst.emitEvent(id1, 32, 'end', dummyPt);
      expect(downEvents).toEqual([33, 32]);
      expect(upEvents).toEqual([33, 32]);
    });

  });

  describe('sticky mode', () => {
    beforeEach(() => {
      controls.stickyTouch.value = true;
    });

    it('should send events only for key the touch originates on', () => {
      const id1 = '1';
      // push down a key
      inst.emitEvent(id1, 33, 'start', dummyPt);
      expect(downEvents).toEqual([33]);
      expect(moveEvents).toEqual([]);
      expect(upEvents).toEqual([]);
      // move to another key
      inst.emitEvent(id1, 32, 'move', dummyPt);
      expect(downEvents).toEqual([33]);
      expect(moveEvents).toEqual([]);
      expect(upEvents).toEqual([]);
      // release key
      inst.emitEvent(id1, 32, 'end', dummyPt);
      expect(downEvents).toEqual([33]);
      expect(moveEvents).toEqual([]);
      expect(upEvents).toEqual([33]);
    });
  });
});
