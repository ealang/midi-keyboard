import { SlideAccum } from './slide-accum';

describe('SlideAccum', () => {
  let inst;
  beforeEach(() => {
    inst = new SlideAccum();
  });

  function pt(x, y) {
    return {x, y};
  }

  it('should track slide from origin', () => {
    const note = 0;
    expect(inst.trackKeySlide(note, pt(1, 0))).toEqual(pt(0, 0));
    expect(inst.trackKeySlide(note, pt(2, -2))).toEqual(pt(1, -2));
    expect(inst.trackKeySlide(note, pt(1, -1))).toEqual(pt(0, -1));
  });

  it('clear accumulated value when cancelled', () => {
    const note = 0;
    inst.trackKeySlide(note, pt(1, 1));
    inst.cancelSlide(note);
    expect(inst.trackKeySlide(note, pt(2, 2))).toEqual(pt(0, 0));
  });

  it('should track multiple keys at once', () => {
    const note1 = 0,
          note2 = 1;
    expect(inst.trackKeySlide(note1, pt(0, 0))).toEqual(pt(0, 0));
    expect(inst.trackKeySlide(note2, pt(0, 0))).toEqual(pt(0, 0));

    expect(inst.trackKeySlide(note1, pt(1, 0))).toEqual(pt(1, 0));
    expect(inst.trackKeySlide(note2, pt(0, 1))).toEqual(pt(0, 1));
  });
});
