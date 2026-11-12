// Critically damped spring: settles without overshoot, like a wooden lid coming to rest.
// Closed form, so the result does not depend on the frame rate.

/**
 * @param {{x:number, v:number}} s position and velocity, mutated in place
 * @param {number} target
 * @param {number} omega angular frequency in rad/s; settles to ~2% in about 5.8/omega seconds
 * @param {number} dt seconds
 */
export function stepSpring(s, target, omega, dt) {
  if (!(dt > 0) || !(omega > 0)) return s;
  const x = s.x - target, e = Math.exp(-omega * dt), c = s.v + omega * x;
  s.x = target + (x + c * dt) * e;
  s.v = (s.v - c * omega * dt) * e;
  return s;
}

/** An impulse that rings down: used where a small rebound is wanted (a branch let go). */
export function stepDamped(s, target, omega, zeta, dt) {
  // Semi-implicit Euler in small substeps keeps an underdamped spring stable at any frame rate.
  const steps = Math.max(1, Math.ceil(dt / .008)), h = dt / steps;
  for (let i = 0; i < steps; i++) {
    s.v += (-omega * omega * (s.x - target) - 2 * zeta * omega * s.v) * h;
    s.x += s.v * h;
  }
  return s;
}

export const settled = (s, target, eps = 1e-3) => Math.abs(s.x - target) < eps && Math.abs(s.v) < eps;
