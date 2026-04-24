/**
 * spring.js — Damped harmonic oscillator for spring physics animations
 *
 * Usage (script tag):
 *   <script src="spring.js"></script>
 *   <script>
 *     // Animate an element with spring physics
 *     animateSpring(document.querySelector('.box'), {
 *       from: { y: 0, scale: 0.5 },
 *       to: { y: -100, scale: 1 },
 *       stiffness: 200,
 *       damping: 15,
 *     });
 *
 *     // Spring to a single value
 *     springValue({
 *       from: 0, to: 100,
 *       stiffness: 300, damping: 20,
 *       onUpdate: (v) => console.log(v),
 *     });
 *   </script>
 *
 * No dependencies. Uses closed-form analytical solution (not iterative).
 * Respects prefers-reduced-motion.
 */

(function (global) {
  'use strict';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     SPRING SOLVER (closed-form damped harmonic oscillator)
     ============================================================ */

  /**
   * Creates a spring solver.
   * @param {Object} config
   * @param {number} [config.stiffness=100] - Spring constant (higher = snappier)
   * @param {number} [config.damping=10]    - Friction (higher = less oscillation)
   * @param {number} [config.mass=1]        - Mass of the object
   * @param {number} [config.velocity=0]    - Initial velocity
   * @param {number} [config.restDelta=0.001] - Threshold to consider "at rest"
   */
  function createSpring(config) {
    const stiffness = config.stiffness ?? 100;
    const damping = config.damping ?? 10;
    const mass = config.mass ?? 1;
    const initialVelocity = config.velocity ?? 0;
    const restDelta = config.restDelta ?? 0.001;

    const omega0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));

    let regime, omegaD;
    if (zeta < 1) {
      regime = 'under';
      omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    } else if (zeta === 1) {
      regime = 'critical';
      omegaD = 0;
    } else {
      regime = 'over';
      omegaD = omega0 * Math.sqrt(zeta * zeta - 1);
    }

    /**
     * Evaluate spring position at time t (in seconds).
     * Returns { value: 0..1 (can overshoot), velocity, done }
     */
    function solve(t) {
      let x, v;

      if (regime === 'under') {
        // Underdamped: oscillates around target
        const envelope = Math.exp(-zeta * omega0 * t);
        const A = -1;
        const B = (-initialVelocity + zeta * omega0) / omegaD;
        x = 1 + envelope * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t));
        v =
          -envelope *
          (zeta * omega0 * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t))) +
          envelope *
          (-A * omegaD * Math.sin(omegaD * t) + B * omegaD * Math.cos(omegaD * t));
      } else if (regime === 'critical') {
        // Critically damped: fastest without oscillation
        const envelope = Math.exp(-omega0 * t);
        x = 1 - envelope * (1 + omega0 * t);
        v = envelope * omega0 * omega0 * t;
      } else {
        // Overdamped: slow return, no oscillation
        const s1 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
        const s2 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
        const A = (s2) / (s2 - s1);
        const B = 1 - A;
        x = 1 + A * Math.exp(s1 * t) + B * Math.exp(s2 * t);
        v = A * s1 * Math.exp(s1 * t) + B * s2 * Math.exp(s2 * t);
      }

      const done = Math.abs(x - 1) < restDelta && Math.abs(v) < restDelta;
      return { value: x, velocity: v, done: done };
    }

    return { solve: solve };
  }

  /* ============================================================
     SPRING VALUE ANIMATION
     ============================================================ */

  /**
   * Animate a single numeric value with spring physics.
   * @param {Object} opts
   * @param {number} opts.from       - Start value
   * @param {number} opts.to         - End value
   * @param {number} [opts.stiffness=100]
   * @param {number} [opts.damping=10]
   * @param {number} [opts.mass=1]
   * @param {function} opts.onUpdate - Called each frame with current value
   * @param {function} [opts.onComplete] - Called when spring settles
   * @returns {{ cancel: function }}
   */
  function springValue(opts) {
    if (prefersReducedMotion) {
      opts.onUpdate(opts.to);
      if (opts.onComplete) opts.onComplete();
      return { cancel: function () {} };
    }

    const spring = createSpring(opts);
    const from = opts.from;
    const to = opts.to;
    const range = to - from;
    let startTime = null;
    let rafId = null;
    let cancelled = false;

    function tick(now) {
      if (cancelled) return;
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000; // seconds

      const state = spring.solve(elapsed);
      const current = from + range * state.value;

      opts.onUpdate(current);

      if (state.done) {
        opts.onUpdate(to); // snap to final
        if (opts.onComplete) opts.onComplete();
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);

    return {
      cancel: function () {
        cancelled = true;
        if (rafId !== null) cancelAnimationFrame(rafId);
      },
    };
  }

  /* ============================================================
     ELEMENT SPRING ANIMATION
     ============================================================ */

  /**
   * Animate DOM element properties with spring physics.
   * @param {Element} el - Target element
   * @param {Object} opts
   * @param {Object} opts.from - Start state { x, y, scale, scaleX, scaleY, rotate, opacity }
   * @param {Object} opts.to   - End state (same keys)
   * @param {number} [opts.stiffness=100]
   * @param {number} [opts.damping=10]
   * @param {number} [opts.mass=1]
   * @param {function} [opts.onComplete]
   * @returns {{ cancel: function }}
   */
  function animateSpring(el, opts) {
    const from = opts.from || {};
    const to = opts.to || {};

    // Determine which properties to animate
    const props = {};
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    for (const key of allKeys) {
      const defaultVal = (key === 'scale' || key === 'scaleX' || key === 'scaleY')
        ? 1
        : key === 'opacity'
          ? 1
          : 0;
      props[key] = {
        from: from[key] ?? defaultVal,
        to: to[key] ?? defaultVal,
      };
    }

    function applyFrame(progress) {
      const vals = {};
      for (const key of Object.keys(props)) {
        const p = props[key];
        vals[key] = p.from + (p.to - p.from) * progress;
      }

      // Build transform string
      const transforms = [];
      if (vals.x !== undefined || vals.y !== undefined) {
        transforms.push(
          'translate3d(' +
            (vals.x ?? 0) + 'px, ' +
            (vals.y ?? 0) + 'px, 0)'
        );
      }
      if (vals.rotate !== undefined) {
        transforms.push('rotate(' + vals.rotate + 'deg)');
      }
      if (vals.scale !== undefined) {
        transforms.push('scale(' + vals.scale + ')');
      } else {
        if (vals.scaleX !== undefined) transforms.push('scaleX(' + vals.scaleX + ')');
        if (vals.scaleY !== undefined) transforms.push('scaleY(' + vals.scaleY + ')');
      }

      if (transforms.length > 0) {
        el.style.transform = transforms.join(' ');
      }

      if (vals.opacity !== undefined) {
        el.style.opacity = vals.opacity;
      }
    }

    return springValue({
      from: 0,
      to: 1,
      stiffness: opts.stiffness ?? 100,
      damping: opts.damping ?? 10,
      mass: opts.mass ?? 1,
      onUpdate: applyFrame,
      onComplete: opts.onComplete,
    });
  }

  /* ============================================================
     PRESETS
     ============================================================ */

  const springPresets = {
    gentle:  { stiffness: 50,  damping: 14 },
    default: { stiffness: 100, damping: 10 },
    wobbly:  { stiffness: 180, damping: 8  },
    stiff:   { stiffness: 300, damping: 20 },
    slow:    { stiffness: 50,  damping: 20 },
    snappy:  { stiffness: 400, damping: 25 },
  };

  /* ============================================================
     EXPORTS
     ============================================================ */

  const Spring = {
    createSpring: createSpring,
    springValue: springValue,
    animateSpring: animateSpring,
    presets: springPresets,
  };

  // UMD export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Spring;
  } else {
    global.Spring = Spring;
    // Convenience globals
    global.createSpring = createSpring;
    global.springValue = springValue;
    global.animateSpring = animateSpring;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
