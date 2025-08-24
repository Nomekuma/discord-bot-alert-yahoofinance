function computeMACD(candles, fast = 12, slow = 26, signal = 9) {
  if (fast >= slow) throw new Error("`fast` must be < `slow`");
  if (!Array.isArray(candles) || candles.length < slow + signal) return [];
  const closes = candles.map((c) => c.close);
  const fastE = ema(closes, fast);
  const slowE = ema(closes, slow);
  const macdRaw = closes.map((_, i) =>
    Number.isNaN(fastE[i]) || Number.isNaN(slowE[i]) ? NaN : fastE[i] - slowE[i]
  );
  const compact = macdRaw.filter((v) => !Number.isNaN(v));
  if (compact.length < signal) return [];
  const sigCompact = ema(compact, signal);
  const firstIdx = macdRaw.findIndex((v) => !Number.isNaN(v));
  const sigAligned = new Array(macdRaw.length).fill(NaN);
  for (let i = 0; i < sigCompact.length; i++)
    sigAligned[firstIdx + i] = sigCompact[i];

  const out = [];
  for (let i = 0; i < candles.length; i++) {
    const m = macdRaw[i],
      s = sigAligned[i];
    if (!Number.isNaN(m) && !Number.isNaN(s))
      out.push({ time: candles[i].time, macd: m, signal: s, histogram: m - s });
  }
  return out;
}

export { computeMACD };
