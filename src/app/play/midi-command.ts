export namespace MidiCommand {
  type MidiCommandSeq = Array<Array<number>>;

  export function noteOn(channel: number, keyNumber: number, velocity: number): MidiCommandSeq {
    return [[0x90 + channel, keyNumber, velocity]];
  }

  export function noteOff(channel: number, keyNumber: number, velocity: number): MidiCommandSeq {
    return [[0x80 + channel, keyNumber, velocity]];
  }

  export function pitchBendSensitivity(channel: number, semitones: number): MidiCommandSeq {
    const cc = 0xB0 + channel;
    return [
      [cc, 101, 0],
      [cc, 100, 0],
      [cc, 6, semitones],
      [cc, 38, 0]
    ];
  }

  function pitchBend(channel: number, val: number): MidiCommandSeq {
    return [[
      0xE0 + channel,
      val & 0x7F,
      val >> 7
    ]];
  }

  export function resetPitchBend(channel: number): MidiCommandSeq {
    return pitchBend(channel, 0x2000);
  }

  export function pitchBendNorm(channel: number, normalizedAmount: number): MidiCommandSeq {
    const bounded = Math.min(Math.max(0, normalizedAmount / 2 + 0.5), 1),
          range = (1 << 14) - 1,
          val = Math.floor(bounded * range);
    return pitchBend(channel, val);
  }
}
