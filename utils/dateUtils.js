import { MINUTE_INTERVALS, RANGE_TO_DAYS } from "../constants/IntervalRange.js";

function normalizeInterval(i) {
  let s = String(i ?? "10m")
    .toLowerCase()
    .trim();
  // common aliases -> canonical forms used in the app
  if (s === "1h") s = "60m";
  if (s === "10min" || s === "10m" || s === "10") s = "10m";
  if (/^\d+min$/.test(s)) s = s.replace(/min$/, "m");
  if (/^\d+$/.test(s)) {
    // plain numbers treated as minutes
    s = `${s}m`;
  }
  return s;
}

function startOfYearUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 0, 0, 0));
}

function buildDateRange({ range, days, interval }) {
  const now = new Date();
  let period2 = now,
    period1;
  const lowerRange = (range ?? "6mo").toString().toLowerCase();
  if (typeof days !== "undefined") {
    period1 = new Date(
      now.getTime() - Math.max(1, Number(days)) * 24 * 60 * 60 * 1000
    );
  } else if (lowerRange === "ytd") {
    period1 = startOfYearUTC(now);
  } else if (lowerRange === "max") {
    period1 = new Date(1900, 0, 1);
  } else if (RANGE_TO_DAYS && RANGE_TO_DAYS[lowerRange]) {
    period1 = new Date(
      now.getTime() - RANGE_TO_DAYS[lowerRange] * 24 * 60 * 60 * 1000
    );
  } else {
    period1 = new Date(now.getTime() - 186 * 24 * 60 * 60 * 1000); // default 6mo
  }
  if (MINUTE_INTERVALS && MINUTE_INTERVALS.has(interval)) {
    const sixMonthsAgo = new Date(now.getTime() - 186 * 24 * 60 * 60 * 1000);
    if (period1 < sixMonthsAgo) period1 = sixMonthsAgo;
  }
  return { period1, period2 };
}

export { normalizeInterval, startOfYearUTC, buildDateRange };
