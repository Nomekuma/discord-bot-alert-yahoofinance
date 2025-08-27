import yf from "yahoo-finance2";
import { aggregateCandles } from "../helper";
async function fetchCandles(symbol, interval, period1, period2) {
  // Yahoo API doesn't support 10m, so request 5m and aggregate into 10m when needed
  let apiInterval = interval;
  let aggregateTo10 = false;
  if (interval === "10m") {
    apiInterval = "5m";
    aggregateTo10 = true;
  }

  const chartOpts = { interval: apiInterval };
  if (period1 !== undefined && period1 !== null) chartOpts.period1 = period1;
  if (period2 !== undefined && period2 !== null) chartOpts.period2 = period2;
  const res = await yf.chart(symbol, chartOpts);
  const quotes = res?.quotes ?? [];
  const coerce = (v) => {
    if (v === undefined || v === null) return NaN;
    if (typeof v === "object") {
      if (Object.prototype.hasOwnProperty.call(v, "raw")) return Number(v.raw);
      // try to coerce other objects
      const n = Number(v);
      return Number.isNaN(n) ? NaN : n;
    }
    const n = Number(v);
    return Number.isNaN(n) ? NaN : n;
  };

  const candles = quotes.map((q) => ({
    time: new Date(q.date),
    open: coerce(q.open),
    high: coerce(q.high),
    low: coerce(q.low),
    close: coerce(q.close),
    volume: coerce(q.volume) || 0,
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
