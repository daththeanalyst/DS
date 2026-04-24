/**
 * physics.js — Bounce, gravity, and inertia animation solvers
 *
 * Usage:
 *   <script src="physics.js"></script>
 *   <script>
 *     // Bounce an element in
 *     Physics.bounce(document.querySelector('.ball'), {
 *       from: { y: -300 },
 *       to: { y: 0 },
 *       restitution: 0.6,  // energy retained per bounce (0-1)
 *       bounces: 4,
 *     });
 *
 *     // Gravity drop
 *     Physics.gravity(document.querySelector('.box'), {
 *       from: { y: 0 },
 *       to: { y: 500 },
 *       acceleration: 980,
 *     });
 *
 *     // Inertia (flick to decelerate)
 *     Physics.inertia(document.querySelector('.card'), {
 *       property: 'x',
 *       velocity: 800,
 *       friction: 0.04,
 *     });
 *   </script>
 *
 * No dependencies. Respects prefers-reduced-motion.
 */

(function (global) {
  'use strict';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     HELPERS
     ============================================================ */

  function applyTransform(el, vals) {
    const transforms = [];
    if (vals.x !== undefined || vals.y !== undefined) {
      transforms.push(
        'translate3d(' + (vals.x || 0) + 'px, ' + (vals.y || 0) + 'px, 0)'
      );
    }
    if (vals.rotate !== undefined) {
      transforms.push('rotate(' + vals.rotate + 'deg)');
    }
    if (vals.scale !== undefined) {
      transforms.push('scale(' + vals.scale + ')');
    }
    if (transforms.length > 0) {
      el.style.transform = transforms.join(' ');
    }
    if (vals.opacity !== undefined) {
      el.style.opacity = vals.opacity;
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* ============================================================
     BOUNCE SOLVER
     Models a ball bouncing with energy loss per bounce.
     Each bounce retains `restitution^2` of the height.
     ============================================================ */

  /**
   * @param {Element} el
   * @param {Object} opts
   * @param {Object} opts.from       - Start values { x, y, scale, rotate, opacity }
   * @param {Object} opts.to         - End values
   * @param {number} [opts.restitution=0.5] - Energy retained per bounce (0-1)
   * @param {number} [opts.bounces=4]       - Number of bounces
   * @param {number} [opts.duration=1200]   - Total duration in ms
   * @param {function} [opts.onComplete]
   */
  function bounce(el, opts) {
    const from = opts.from || {};
    const to = opts.to || {};
    const restitution = opts.restitution ?? 0.5;
    const numBounces = opts.bounces ?? 4;
    const totalDuration = opts.duration ?? 1200;

    if (prefersReducedMotion) {
      applyTransform(el, to);
      if (opts.onComplete) opts.onComplete();
      return { cancel: function () {} };
    }

    // Pre-compute bounce timing
    // Each bounce takes restitution times as long as the previous
    const bounceDurations = [];
    let sum = 1;
    bounceDurations.push(1);
    for (let i = 1; i <= numBounces; i++) {
      const d = Math.pow(restitution, i);
      bounceDurations.push(d);
      sum += d;
    }
    // Normalize to total duration
    const normalizedDurations = bounceDurations.map(function (d) {
      return d / sum;
    });

    // Compute cumulative time boundaries
    const boundaries = [0];
    for (let i = 0; i < normalizedDurations.length; i++) {
      boundaries.push(boundaries[i] + normalizedDurations[i]);
    }

    let startTime = null;
    let rafId = null;
    let cancelled = false;

    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    const props = {};
    for (const key of allKeys) {
      const defVal = (key === 'scale') ? 1 : (key === 'opacity') ? 1 : 0;
      props[key] = { from: from[key] ?? defVal, to: to[key] ?? defVal };
    }

    function tick(now) {
      if (cancelled) return;
      if (startTime === null) startTime = now;
      const t = Math.min((now - startTime) / totalDuration, 1);

      // Find which bounce segment we're in
      let segment = 0;
      for (let i = 0; i < boundaries.length - 1; i++) {
        if (t >= boundaries[i] && t < boundaries[i + 1]) {
          segment = i;
          break;
        }
      }
      if (t >= 1) segment = normalizedDurations.length - 1;

      // Progress within this segment (0-1)
      const segStart = boundaries[segment];
      const segEnd = boundaries[segment + 1] || 1;
      const segProgress = Math.min((t - segStart) / (segEnd - segStart), 1);

      // Parabolic arc: peaks at 0.5, returns to 0 at 1
      // Amplitude decreases with each bounce
      const amplitude = Math.pow(restitution, segment);
      const parabola = segment === 0
        ? segProgress * segProgress // first segment: accelerating down
        : 4 * segProgress * (1 - segProgress); // subsequent: parabolic arc

      // Compute values
      const vals = {};
      for (const key of Object.keys(props)) {
        const p = props[key];
        const baseProgress = t; // linear approach to target
        const bounceOffset = segment === 0 ? 0 : parabola * amplitude * (p.from - p.to);
        vals[key] = lerp(p.from, p.to, baseProgress) + bounceOffset;
      }

      applyTransform(el, vals);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        applyTransform(el, to);
        if (opts.onComplete) opts.onComplete();
      }
    }

    rafId = requestAnimationFrame(tick);
    return {
      cancel: function () {
        cancelled = true;
        if (rafId) cancelAnimationFrame(rafId);
      },
    };
  }

  /* ============================================================
     GRAVITY SOLVER
     Constant acceleration: position = 0.5 * g * t^2
     ============================================================ */

  /**
   * @param {Element} el
   * @param {Object} opts
   * @param {Object} opts.from
   * @param {Object} opts.to
   * @param {number} [opts.acceleration=980] - px/s^2
   * @param {number} [opts.maxDuration=2000] - safety cap in ms
   * @param {function} [opts.onComplete]
   */
  function gravity(el, opts) {
    const from = opts.from || {};
    const to = opts.to || {};
    const g = opts.acceleration ?? 980;
    const maxDuration = opts.maxDuration ?? 2000;

    if (prefersReducedMotion) {
      applyTransform(el, to);
      if (opts.onComplete) opts.onComplete();
      return { cancel: function () {} };
    }

    // Calculate how long it takes to cover the distance
    // For the primary property, compute time from distance = 0.5 * g * t^2
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    const props = {};
    let maxDistance = 0;
    for (const key of allKeys) {
      const defVal = (key === 'scale') ? 1 : (key === 'opacity') ? 1 : 0;
      const f = from[key] ?? defVal;
      const t = to[key] ?? defVal;
      props[key] = { from: f, to: t };
      maxDistance = Math.max(maxDistance, Math.abs(t - f));
    }

    // time = sqrt(2 * distance / g)
    const fallTime = Math.min(Math.sqrt(2 * maxDistance / g) * 1000, maxDuration);

    let startTime = null;
    let rafId = null;
    let cancelled = false;

    function tick(now) {
      if (cancelled) return;
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / fallTime, 1);

      // Quadratic easing (gravity acceleration)
      const progress = t * t;

      const vals = {};
      for (const key of Object.keys(props)) {
        const p = props[key];
        vals[key] = lerp(p.from, p.to, progress);
      }

      applyTransform(el, vals);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        applyTransform(el, to);
        if (opts.onComplete) opts.onComplete();
      }
    }

    rafId = requestAnimationFrame(tick);
    return {
      cancel: function () {
        cancelled = true;
        if (rafId) cancelAnimationFrame(rafId);
      },
    };
  }

  /* ============================================================
     INERTIA SOLVER
     Exponential velocity decay: v(t) = v0 * (1 - friction)^t
     ============================================================ */

  /**
   * @param {Element} el
   * @param {Object} opts
   * @param {string} opts.property       - 'x', 'y', 'rotate', etc.
   * @param {number} opts.velocity       - Initial velocity (px/s or deg/s)
   * @param {number} [opts.friction=0.04] - Deceleration (0-1, higher = faster stop)
   * @param {number} [opts.startValue=0]  - Current value of the property
   * @param {number} [opts.min]           - Minimum bound
   * @param {number} [opts.max]           - Maximum bound
   * @param {number} [opts.restVelocity=0.5] - Stop threshold
   * @param {function} [opts.onUpdate]    - Called with current value each frame
   * @param {function} [opts.onComplete]
   */
  function inertia(el, opts) {
    const property = opts.property || 'x';
    let velocity = opts.velocity || 0;
    const friction = 1 - (opts.friction ?? 0.04);
    let value = opts.startValue ?? 0;
    const min = opts.min;
    const max = opts.max;
    const restVelocity = opts.restVelocity ?? 0.5;

    if (prefersReducedMotion) {
      if (opts.onComplete) opts.onComplete();
      return { cancel: function () {} };
    }

    let lastTime = null;
    let rafId = null;
    let cancelled = false;

    function tick(now) {
      if (cancelled) return;
      if (lastTime === null) lastTime = now;
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      velocity *= Math.pow(friction, dt * 60);
      value += velocity * dt;

      // Boundary clamping with bounce-back
      if (min !== undefined && value < min) {
        value = min;
        velocity = Math.abs(velocity) * 0.5;
      }
      if (max !== undefined && value > max) {
        value = max;
        velocity = -Math.abs(velocity) * 0.5;
      }

      // Apply to element
      const vals = {};
      vals[property] = value;
      applyTransform(el, vals);

      if (opts.onUpdate) opts.onUpdate(value);

      if (Math.abs(velocity) > restVelocity) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (opts.onComplete) opts.onComplete();
      }
    }

    rafId = requestAnimationFrame(tick);
    return {
      cancel: function () {
        cancelled = true;
        if (rafId) cancelAnimationFrame(rafId);
      },
    };
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var Physics = {
    bounce: bounce,
    gravity: gravity,
    inertia: inertia,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Physics;
  } else {
    global.Physics = Physics;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
