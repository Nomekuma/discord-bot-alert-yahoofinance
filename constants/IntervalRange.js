export const VALID_INTERVALS = new Set([
  "1m",
  "2m",
  "5m",
  "15m",
  "30m",
  "60m",
  "90m",
  "1d",
  "5d",
  "1wk",
  "1mo",
  "3mo",
  "10m", // custom, aggregated from 5m
]);

export const MINUTE_INTERVALS = new Set([
  "1m",
  "2m",
  "10m", // custom, aggregated from 5m
  "5m",
  "15m",
  "30m",
  "60m",
  "90m",
]);

export const RANGE_TO_DAYS = {
  "1d": 1,
  "5d": 5,
  "1mo": 31,
  "3mo": 93,
  "6mo": 186,
  "1y": 372,
  "2y": 744,
  "5y": 1860,
  "10y": 3720,
};

// expose to globalThis so utilities can access these mappings without importing
if (typeof globalThis !== "undefined") {
  globalThis.MINUTE_INTERVALS = MINUTE_INTERVALS;
  globalThis.RANGE_TO_DAYS = RANGE_TO_DAYS;
}
