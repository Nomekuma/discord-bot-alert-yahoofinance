import { ema } from "./EMA.js";

export function computeMACD(candles, fast = 12, slow = 26, signal = 9) {
  if (fast >= slow) throw new Error("`fast` must be < `slow`");
  if (!Array.isArray(candles)) return [];

  const closes = candles.map((c) => c?.close);
  const fastE = ema(closes, fast);
  const slowE = ema(closes, slow);

  const macdRaw = closes.map((_, i) =>
    Number.isFinite(fastE[i]) && Number.isFinite(slowE[i])
      ? fastE[i] - slowE[i]
      : NaN
  );

  // Signal on compact (finite) segment
  const indices = [];
  const compact = [];
  for (let i = 0; i < macdRaw.length; i++) {
    if (Number.isFinite(macdRaw[i])) {
      indices.push(i);
      compact.push(macdRaw[i]);
    }
  }
  if (compact.length < signal) return []; // still not enough usable points

  const sigCompact = ema(compact, signal);

  // align signal back to original timeline
  const sigAligned = new Array(macdRaw.length).fill(NaN);
  for (let j = 0; j < sigCompact.length; j++) {
    const idx = indices[j];
    sigAligned[idx] = sigCompact[j];
  }

  const out = [];
  for (let i = 0; i < candles.length; i++) {
    const m = macdRaw[i],
      s = sigAligned[i];
    if (Number.isFinite(m) && Number.isFinite(s)) {
      out.push({
        time: candles[i].time,
        macd: m,
        signal: s,
        histogram: m - s,
      });
    }
  }
  return out;
}
