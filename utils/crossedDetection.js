const EPS = 1e-8;

export function crossed(prevDiff, currDiff, eps = EPS) {
  const p = Math.abs(prevDiff) <= eps ? 0 : prevDiff;
  const c = Math.abs(currDiff) <= eps ? 0 : currDiff;
  return p < 0 && c > 0 ? "up" : p > 0 && c < 0 ? "down" : null;
}

export function slopeConfirm(prevMACD, currMACD, dir, eps = EPS) {
  const s = currMACD - prevMACD;
  return dir === "up" ? s > -eps : s < eps;
}

export function zeroLineConfirm(currMACD, dir, eps = EPS) {
  return dir === "up" ? currMACD < eps : currMACD > -eps;
}

// Scan last N bars to find a recent cross (use when you don't want to miss a cross by 1 bar)
export function findRecentCross(macd, lookbackBars = 0, eps = EPS) {
  if (!Array.isArray(macd) || macd.length < 2) return { dir: null, idx: -1 };
  const diffs = macd.map((p) => p.macd - p.signal);
  const start = Math.max(1, macd.length - 1 - Math.max(0, lookbackBars));
  const sgn = (v) => (Math.abs(v) <= eps ? 0 : v > 0 ? 1 : -1);
  for (let i = start; i < diffs.length; i++) {
    const a = sgn(diffs[i - 1]),
      b = sgn(diffs[i]);
    if (a < 0 && b > 0) return { dir: "up", idx: i };
    if (a > 0 && b < 0) return { dir: "down", idx: i };
  }
  return { dir: null, idx: -1 };
}

// Closed-bar guard: returns true if `time` lands exactly on interval boundary
export function isBarClosed(time, interval) {
  const t = new Date(time);
  const m = t.getUTCMinutes();
  const s = t.getUTCSeconds();
  const ms = t.getUTCMilliseconds();
  if (s || ms) return false;
  if (/^\d+m$/.test(interval)) {
    const step = Number(interval.replace("m", ""));
    return m % step === 0;
  }
  if (/^\d+h$/.test(interval)) {
    const step = Number(interval.replace("h", ""));
    return m === 0 && t.getUTCHours() % step === 0;
  }
  return true;
}
