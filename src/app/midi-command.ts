export type MidiCommandSeq = Array<Array<number>>;

export namespace MidiCommand {
  export function noteOn(channel: number, keyNumber: number, velocity: number): MidiCommandSeq {
    return [[0x90 + channel, keyNumber, velocity]];
  }

  export function noteOff(channel: number, keyNumber: number, velocity: number): MidiCommandSeq {
    return [[0x80 + channel, keyNumber, velocity]];
  }
}
