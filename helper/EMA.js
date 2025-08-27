export function ema(values, period) {
  if (!Number.isInteger(period) || period <= 0)
    throw new Error("EMA period must be > 0");
  if (!Array.isArray(values)) return [];

  const out = new Array(values.length).fill(NaN);
  const k = 2 / (period + 1);

  // find the first index where we have 'period' consecutive finite values
  let start = -1,
    run = 0;
  for (let i = 0; i < values.length; i++) {
    if (Number.isFinite(values[i])) {
      run++;
      if (run === period) {
        start = i - period + 1;
        break;
      }
    } else {
      run = 0;
    }
  }
  if (start === -1) return out; // never enough clean data to seed

  // seed with SMA over that clean window
  let sum = 0;
  for (let i = start; i < start + period; i++) sum += values[i];
  out[start + period - 1] = sum / period;

  // advance EMA; when value is NaN, carry forward previous EMA
  for (let i = start + period; i < values.length; i++) {
    const prev = out[i - 1];
    if (!Number.isFinite(prev)) {
      out[i] = NaN;
      continue;
    }
    const v = values[i];
    out[i] = Number.isFinite(v) ? v * k + prev * (1 - k) : prev;
  }
  return out;
}
