import { TouchStack, TouchStackEvent } from './touchstack';

describe('TouchStack', () => {
  let inst: TouchStack,
      downEvents: Array<number>,
      upEvents: Array<number>;

  beforeEach(() => {
    downEvents = [];
    upEvents = [];
    const onKeyDown = (index: number) => downEvents.push(index);
    const onKeyUp = (index: number) => upEvents.push(index);
    inst = new TouchStack(onKeyDown, onKeyUp);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
  });

  it('should send events as touch moves along keys', () => {
    const id1 = '1';
    // push down a key
    inst.push(id1, 33, TouchStackEvent.Down);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // move to another key
    inst.push(id1, 32, TouchStackEvent.Move);
    expect(downEvents).toEqual([33, 32]);
    expect(upEvents).toEqual([33]);
    // release key
    inst.push(id1, 32, TouchStackEvent.Up);
    expect(downEvents).toEqual([33, 32]);
    expect(upEvents).toEqual([33, 32]);
  });

  it('should not play key if touch began off keyboard and later moves onto keyboard', () => {
    const id1 = '1';
    // touch down off keyboard
    inst.push(id1, null, TouchStackEvent.Down);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
    // move onto key
    inst.push(id1, 33, TouchStackEvent.Move);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
    // release
    inst.push(id1, 33, TouchStackEvent.Up);
    expect(downEvents).toEqual([]);
    expect(upEvents).toEqual([]);
  });

  it('should keep key held even if touch moves off keyboard', () => {
    const id1 = '1';
    // push down a key
    inst.push(id1, 33, TouchStackEvent.Down);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // move off keyboard
    inst.push(id1, null, TouchStackEvent.Move);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // release touch
    inst.push(id1, null, TouchStackEvent.Up);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([33]);
  });

  it('should not allow key to be pressed if already pressed', () => {
    const id1 = '1', id2 = '2';
    // id1: push down a key
    inst.push(id1, 33, TouchStackEvent.Down);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id2: push down same key
    inst.push(id2, 33, TouchStackEvent.Down);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id1: release
    inst.push(id1, 33, TouchStackEvent.Up);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([]);
    // id2: release
    inst.push(id2, 33, TouchStackEvent.Up);
    expect(downEvents).toEqual([33]);
    expect(upEvents).toEqual([33]);
  });

  it('should send off events for held keys when keyboard is reset', () => {
    const id1 = '1', id2 = '2', id3 = '3';
    inst.push(id1, 0, TouchStackEvent.Down);
    inst.push(id2, 0, TouchStackEvent.Down);
    inst.push(id3, 1, TouchStackEvent.Down);
    inst.push(id3, 1, TouchStackEvent.Up);
    expect(downEvents).toEqual([0, 1]);
    expect(upEvents).toEqual([1]);

    inst.reset();
    expect(downEvents).toEqual([0, 1]);
    expect(upEvents).toEqual([1, 0]);
  });

  it('should send off event for old key if id is re-used to play a new key without releasing old key', () => {
    const id1 = '1';
    inst.push(id1, 32, TouchStackEvent.Down);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.push(id1, 30, TouchStackEvent.Down);
    expect(downEvents).toEqual([32, 30]);
    expect(upEvents).toEqual([32]);
    inst.push(id1, 28, TouchStackEvent.Up);
    expect(downEvents).toEqual([32, 30]);
    expect(upEvents).toEqual([32, 30]);
  });

  it('should ignore further movement if touches are marked frozen', () => {
    const id1 = '1';
    inst.push(id1, 32, TouchStackEvent.Down);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.freezeAll();
    inst.push(id1, 33, TouchStackEvent.Move);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([]);
    inst.push(id1, 33, TouchStackEvent.Up);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([32]);
  });

  it('should unfreeze touch after key is lifted', () => {
    const id1 = '1';
    // 1st action
    inst.push(id1, 32, TouchStackEvent.Down);
    inst.freezeAll();
    inst.push(id1, 33, TouchStackEvent.Move);
    inst.push(id1, 33, TouchStackEvent.Up);
    expect(downEvents).toEqual([32]);
    expect(upEvents).toEqual([32]);

    // 2nd action
    inst.push(id1, 34, TouchStackEvent.Down);
    inst.push(id1, 35, TouchStackEvent.Move);
    inst.freezeAll();
    expect(downEvents).toEqual([32, 34, 35]);
    expect(upEvents).toEqual([32, 34]);
  });
});
