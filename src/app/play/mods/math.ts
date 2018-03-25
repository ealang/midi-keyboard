export function applyDeadZone(value: number, deadzone: number): number {
  return Math.abs(value) < deadzone ?
    0 :
    value - Math.sign(value) * deadzone;
}

function bound(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

export function normToMidi(normValue: number, invert: boolean): number {
  return Math.floor(bound(invert ? 1 - normValue : normValue, 0, 1) * 127);
}

