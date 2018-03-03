import { TestBed } from '@angular/core/testing';

import { TouchService, TouchEvent } from './touch.service';

describe('TouchService', () => {
  const dummyPt = {x: 0, y: 0};
  let inst;
  beforeEach(() => {
    inst = new TouchService();
  });

  it('should allow subscription to element events', () => {
    const events = [];
    inst.subscribe('keys/1', (e) => events.push(e));

    expect(events.length).toEqual(0);
    inst.emitEvent('start', 'mouse', 'keys/1', {x: 0, y: 0});
    expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'keys/1', dummyPt));

    inst.emitEvent('move', 'mouse', 'keys/1', {x: 0, y: 0});
    expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'keys/1', dummyPt));

    inst.emitEvent('end', 'mouse', 'keys/1', {x: 0, y: 0});
    expect(events[2]).toEqual(new TouchEvent('end', 'mouse', 'keys/1', dummyPt));
    expect(events.length).toEqual(3);
  });

  it('should allow hierarchical subscription', () => {
    const events = [];
    inst.subscribe('a/b', (e) => events.push(e));

    expect(events.length).toEqual(0);
    inst.emitEvent('start', 'touch1', 'a/b/c', dummyPt);
    inst.emitEvent('start', 'touch2', 'a/b', dummyPt);
    inst.emitEvent('start', 'touch3', 'a', dummyPt);
    inst.emitEvent('start', 'touch4', 'a/bb', dummyPt);

    expect(events).toEqual([
      new TouchEvent('start', 'touch1', 'a/b/c', dummyPt),
      new TouchEvent('start', 'touch2', 'a/b', dummyPt)
    ]);
  });

  it('should conceal elemId if touch is no longer contained in subscription', () => {
    const events = [];
    inst.subscribe('keys', (e) => events.push(e));

    expect(events.length).toEqual(0);

    inst.emitEvent('start', 'mouse', 'keys', dummyPt);
    expect(events[0]).toEqual(new TouchEvent('start', 'mouse', 'keys', dummyPt));

    inst.emitEvent('move', 'mouse', 'keys/1', dummyPt);
    expect(events[1]).toEqual(new TouchEvent('move', 'mouse', 'keys/1', dummyPt));

    inst.emitEvent('move', 'mouse', 'dragbar', dummyPt);
    expect(events[2]).toEqual(new TouchEvent('move', 'mouse', null, dummyPt));

    inst.emitEvent('end', 'mouse', 'keys', dummyPt);
    expect(events[3]).toEqual(new TouchEvent('end', 'mouse', 'keys', dummyPt));
    expect(events.length).toEqual(4);
  });
});
