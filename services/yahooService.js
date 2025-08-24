import yf from "yahoo-finance2";

async function fetchCandles(symbol, interval, period1, period2) {
  const res = await yf.chart(symbol, { interval, period1, period2 });
  const quotes = res?.quotes ?? [];
  return quotes.map((q) => ({
    time: new Date(q.date),
    open: q.open,
    high: q.high,
    low: q.low,
    close: q.close,
    volume: q.volume,
  }));
}

export { fetchCandles };
