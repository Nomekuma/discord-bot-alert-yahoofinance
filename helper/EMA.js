function ema(values, period) {
  if (!Number.isInteger(period) || period <= 0)
    throw new Error("EMA period must be > 0");
  if (!Array.isArray(values) || values.length < period) return [];
  const k = 2 / (period + 1);
  const out = new Array(values.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  out[period - 1] = sum / period;
  for (let i = period; i < values.length; i++)
    out[i] = values[i] * k + out[i - 1] * (1 - k);
  return out;
}
