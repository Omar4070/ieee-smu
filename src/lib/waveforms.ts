/**
 * The power story's waveforms as SVG path data, in the SVG's own pixels. Used at
 * build time for the still version and on every frame by the live one.
 */
const TAU = Math.PI * 2;

/** One supply cycle on screen, so a phone shows fewer cycles than a wide monitor. */
export const cycleLength = (width: number) => Math.min(560, Math.max(220, width / 2.6));
const amplitude = (height: number) => Math.min(height * 0.42, 130);

const trace = (width: number, height: number, y: (x: number) => number) => {
  const mid = height / 2;
  let d = '';
  for (let x = 0; x <= width + 4; x += 4) {
    d += `${x === 0 ? 'M' : 'L'}${x} ${(mid - y(x)).toFixed(1)}`;
  }
  return d;
};

/**
 * A variable-speed drive starting a motor: voltage and frequency rise together
 * (V/f control), so the line grows and tightens. `speed` runs from 0 to 1.
 */
export const motorWave = (width: number, height: number, speed: number, phase: number) => {
  const k = (TAU * speed) / (cycleLength(width) / 2);
  const a = amplitude(height) * speed;
  return trace(width, height, (x) => a * Math.sin(k * x - phase));
};

/** How far the sine reference reaches into the carrier in the pulse pattern. */
const MODULATION = 0.9;

/**
 * Sine-triangle PWM, as in a real inverter: the output is high while the sine
 * reference is above a triangle carrier. `ratio` is carrier cycles per sine cycle.
 * Only the switching edges become vertices, so the corners stay perfectly square.
 */
export const pulseWave = (width: number, height: number, ratio: number, shift: number) => {
  const length = cycleLength(width);
  const mid = height / 2;
  const a = amplitude(height);
  const level = (x: number) => {
    const u = (x - shift) / length;
    const c = ((u * ratio) % 1 + 1) % 1;
    return MODULATION * Math.sin(TAU * u) > 4 * Math.abs(c - 0.5) - 1 ? 1 : -1;
  };
  let state = level(0);
  let d = `M0 ${(mid - a * state).toFixed(1)}`;
  for (let x = 1; x <= width; x += 1) {
    const next = level(x);
    if (next !== state) {
      d += `H${x}V${(mid - a * next).toFixed(1)}`;
      state = next;
    }
  }
  return `${d}H${width}`;
};

/** The sine the pulses average out to. */
export const referenceWave = (width: number, height: number, shift: number) => {
  const length = cycleLength(width);
  const a = amplitude(height) * MODULATION;
  return trace(width, height, (x) => a * Math.sin((TAU * (x - shift)) / length));
};

/** One phase of the supply, `offset` radians from the others. */
export const phaseWave = (width: number, height: number, offset: number, phase: number) => {
  const length = cycleLength(width);
  const a = amplitude(height);
  return trace(width, height, (x) => a * Math.sin((TAU * x) / length - phase - offset));
};
