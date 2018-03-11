import { TestBed } from '@angular/core/testing';

import { TouchService, TouchEvent } from './touch.service';

describe('TouchService', () => {
  const dummyPt = {x: 0, y: 0};
  let inst;
  beforeEach(() => {
    inst = new TouchService();
  });

  describe('origin touch subscription', () => {
    let events;
    beforeEach(() => {
      events = [];
      inst.subscribeOrigin('keys', (e) => events.push(e));
      expect(events.length).toEqual(0);
    });

    it('should capture touches that start on element', () => {
      inst.emitEvent('start', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'keys:1', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'keys:1', dummyPt, dummyPt));

      inst.emitEvent('end', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events[2]).toEqual(new TouchEvent('end', 'mouse', 'keys:1', dummyPt, dummyPt));
      expect(events.length).toEqual(3);
    });

    it('should ignore touches that cross element', () => {
      inst.emitEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events.length).toEqual(0);

      inst.emitEvent('move', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events.length).toEqual(0);

      inst.emitEvent('end', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events.length).toEqual(0);
    });

    it('should conceal current element id if touch is no longer contained in subscription element', () => {
      inst.emitEvent('start', 'mouse', 'keys:0', dummyPt, dummyPt);
      expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'keys:0', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'keys:1', dummyPt, dummyPt);
      expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'keys:1', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[2]).toEqual(new TouchEvent('move', 'mouse', null, dummyPt, dummyPt));

      inst.emitEvent('end', 'mouse', 'keys:2', dummyPt, dummyPt);
      expect(events[3]).toEqual(new TouchEvent('end', 'mouse', 'keys:2', dummyPt, dummyPt));
      expect(events.length).toEqual(4);
    });
  });

  describe('sticky touch subscription', () => {
    let events;
    beforeEach(() => {
      events = [];
      inst.subscribeSticky('dragbar', (e) => events.push(e));
      expect(events.length).toEqual(0);
    });

    it('should capture touches that start on element', () => {
      inst.emitEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt));

      inst.emitEvent('end', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[2]).toEqual(new TouchEvent('end', 'mouse', 'dragbar', dummyPt, dummyPt));
      expect(events.length).toEqual(3);
    });

    it('should capture touches that cross element', () => {
      inst.emitEvent('start', 'mouse', 'keys:0', dummyPt, dummyPt);
      expect(events.length).toEqual(0);

      inst.emitEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'dragbar', dummyPt, dummyPt));

      inst.emitEvent('end', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[2]).toEqual(new TouchEvent('end', 'mouse', 'dragbar', dummyPt, dummyPt));
      expect(events.length).toEqual(3);
    });

    it('should conceal current element id if touch is no longer contained in subscription', () => {
      inst.emitEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt);
      expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'dragbar', dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', null, dummyPt, dummyPt);
      expect(events[1]).toEqual(new TouchEvent('move', 'mouse', null, dummyPt, dummyPt));

      inst.emitEvent('move', 'mouse', 'keys:0', dummyPt, dummyPt);
      expect(events[2]).toEqual(new TouchEvent('move', 'mouse', null, dummyPt, dummyPt));
      expect(events.length).toEqual(3);
    });
  });
});
