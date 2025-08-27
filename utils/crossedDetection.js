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
