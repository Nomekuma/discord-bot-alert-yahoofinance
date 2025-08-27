import yf from "yahoo-finance2";

export function aggregateCandles(
  candles,
  { targetMinutes = 10, sourceMinutes = 5, requireFull = true } = {}
) {
  if (!candles?.length) return [];
  if (targetMinutes % sourceMinutes !== 0) {
    throw new Error(`targetMinutes must be multiple of sourceMinutes`);
  }
  const perBucket = targetMinutes / sourceMinutes;

  // Normalize input order
  const sorted = candles
    .slice()
    .sort((a, b) => +new Date(a.time) - +new Date(b.time));

  const buckets = new Map();
  const counts = new Map();

  for (const c of sorted) {
    const t = new Date(c.time);
    const year = t.getUTCFullYear();
    const month = t.getUTCMonth();
    const date = t.getUTCDate();
    const hour = t.getUTCHours();
    const minuteBucket =
      Math.floor(t.getUTCMinutes() / targetMinutes) * targetMinutes;

    const key = Date.UTC(year, month, date, hour, minuteBucket);
    if (!buckets.has(key)) {
      buckets.set(key, {
        time: new Date(key),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume ?? 0,
      });
      counts.set(key, 1);
    } else {
      const agg = buckets.get(key);
      agg.high = Math.max(agg.high, c.high ?? -Infinity);
      agg.low = Math.min(agg.low, c.low ?? Infinity);
      agg.close = c.close;
      agg.volume = (agg.volume || 0) + (c.volume || 0);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Array.from(buckets.entries())
    .filter(([k]) => !requireFull || (counts.get(k) || 0) >= perBucket)
    .map(([_, v]) => v)
    .sort((a, b) => +a.time - +b.time);
}

async function fetchCandles(symbol, interval, period1, period2) {
  // Yahoo API doesn't support 10m, so request 5m and aggregate into 10m when needed
  let apiInterval = interval;
  let aggregateTo10 = false;
  if (interval === "10m") {
    apiInterval = "5m";
    aggregateTo10 = true;
  }

  const res = await yf.chart(symbol, {
    interval: apiInterval,
    period1,
    period2,
  });
  const quotes = res?.quotes ?? [];
  const candles = quotes.map((q) => ({
    time: new Date(q.date),
    open: q.open,
    high: q.high,
    low: q.low,
    close: q.close,
    volume: q.volume,
  }));

  if (aggregateTo10) {
    return aggregateCandles(candles, {
      targetMinutes: 10,
      sourceMinutes: 5,
      requireFull: false,
    });
  }
  return candles;
}

export { fetchCandles };
