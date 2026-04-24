/**
 * distortion.js — Canvas-based hover warp/distortion effect
 *
 * Usage:
 *   <script src="distortion.js"></script>
 *   <script>
 *     // Ripple distortion on an image
 *     Distortion.ripple('.hero-image', {
 *       radius: 100,       // ripple radius in px
 *       strength: 0.3,     // warp intensity (0-1)
 *       smoothing: 0.05,   // return-to-normal speed
 *     });
 *
 *     // Stretch distortion on hover
 *     Distortion.stretch('.card', {
 *       maxStretch: 20,
 *       direction: 'both', // 'horizontal' | 'vertical' | 'both'
 *     });
 *
 *     // Noise/jitter distortion
 *     Distortion.noise('.glitch-target', {
 *       intensity: 5,      // px jitter
 *       frequency: 100,    // ms between jitters
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
     RIPPLE DISTORTION
     Creates a ripple warp effect around the cursor position.
     Uses CSS transforms for performance (no canvas needed).
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.radius=100]
   * @param {number} [opts.strength=0.3]
   * @param {number} [opts.smoothing=0.05]
   * @returns {{ destroy: function }}
   */
  function ripple(target, opts) {
    opts = opts || {};
    const radius = opts.radius ?? 100;
    const strength = opts.strength ?? 0.3;
    const smoothing = opts.smoothing ?? 0.05;

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    const cleanups = [];

    elements.forEach(function (el) {
      let currentScale = 1;
      let targetScale = 1;
      let currentSkewX = 0;
      let currentSkewY = 0;
      let targetSkewX = 0;
      let targetSkewY = 0;
      let isHovering = false;
      let destroyed = false;
      let rafId;

      el.style.transition = 'none';
      el.style.willChange = 'transform';

      function onMouseMove(e) {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        targetSkewX = x * strength * 10;
        targetSkewY = y * strength * 10;
        targetScale = 1 + strength * 0.1;
      }

      function onMouseEnter() {
        isHovering = true;
        animate();
      }

      function onMouseLeave() {
        isHovering = false;
        targetScale = 1;
        targetSkewX = 0;
        targetSkewY = 0;
      }

      function animate() {
        if (destroyed) return;

        currentScale += (targetScale - currentScale) * smoothing;
        currentSkewX += (targetSkewX - currentSkewX) * smoothing;
        currentSkewY += (targetSkewY - currentSkewY) * smoothing;

        el.style.transform =
          'scale(' + currentScale + ') ' +
          'skew(' + currentSkewX + 'deg, ' + currentSkewY + 'deg)';

        const isSettled =
          Math.abs(currentScale - targetScale) < 0.001 &&
          Math.abs(currentSkewX - targetSkewX) < 0.01 &&
          Math.abs(currentSkewY - targetSkewY) < 0.01;

        if (!isSettled || isHovering) {
          rafId = requestAnimationFrame(animate);
        } else if (!isHovering) {
          el.style.transform = '';
        }
      }

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(function () {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        el.style.transform = '';
        el.style.willChange = '';
      });
    });

    return {
      destroy: function () { cleanups.forEach(function (fn) { fn(); }); },
    };
  }

  /* ============================================================
     STRETCH DISTORTION
     Element stretches in the direction of cursor movement.
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.maxStretch=20]
   * @param {string} [opts.direction='both'] - 'horizontal' | 'vertical' | 'both'
   * @param {number} [opts.smoothing=0.08]
   * @returns {{ destroy: function }}
   */
  function stretch(target, opts) {
    opts = opts || {};
    const maxStretch = opts.maxStretch ?? 20;
    const direction = opts.direction || 'both';
    const smoothFactor = opts.smoothing ?? 0.08;

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    const cleanups = [];

    elements.forEach(function (el) {
      let lastX = 0, lastY = 0;
      let velocityX = 0, velocityY = 0;
      let currentScaleX = 1, currentScaleY = 1;
      let destroyed = false;
      let rafId;

      function onMouseMove(e) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        velocityX = dx;
        velocityY = dy;
      }

      function animate() {
        if (destroyed) return;

        const targetScaleX = direction !== 'vertical'
          ? 1 + Math.min(Math.abs(velocityX) / maxStretch, 0.3) * Math.sign(velocityX) * 0.1
          : 1;
        const targetScaleY = direction !== 'horizontal'
          ? 1 + Math.min(Math.abs(velocityY) / maxStretch, 0.3) * Math.sign(velocityY) * 0.1
          : 1;

        currentScaleX += (targetScaleX - currentScaleX) * smoothFactor;
        currentScaleY += (targetScaleY - currentScaleY) * smoothFactor;

        velocityX *= 0.9;
        velocityY *= 0.9;

        el.style.transform = 'scaleX(' + currentScaleX + ') scaleY(' + currentScaleY + ')';

        rafId = requestAnimationFrame(animate);
      }

      el.addEventListener('mousemove', onMouseMove);
      animate();

      cleanups.push(function () {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        el.removeEventListener('mousemove', onMouseMove);
        el.style.transform = '';
      });
    });

    return {
      destroy: function () { cleanups.forEach(function (fn) { fn(); }); },
    };
  }

  /* ============================================================
     NOISE / JITTER DISTORTION
     Random transform jitter for a glitchy/unstable feel.
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.intensity=5]    - Max px jitter
   * @param {number} [opts.frequency=100]  - ms between jitters
   * @param {boolean} [opts.rotate=true]   - Include rotation jitter
   * @param {boolean} [opts.continuous=false] - Run always (vs hover-only)
   * @returns {{ destroy: function }}
   */
  function noise(target, opts) {
    opts = opts || {};
    const intensity = opts.intensity ?? 5;
    const frequency = opts.frequency ?? 100;
    const rotate = opts.rotate !== false;
    const continuous = opts.continuous || false;

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    const cleanups = [];

    elements.forEach(function (el) {
      let intervalId = null;
      let isActive = continuous;

      function jitter() {
        const x = (Math.random() - 0.5) * intensity * 2;
        const y = (Math.random() - 0.5) * intensity * 2;
        const r = rotate ? (Math.random() - 0.5) * intensity * 0.5 : 0;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + r + 'deg)';
      }

      function start() {
        if (intervalId) return;
        isActive = true;
        intervalId = setInterval(jitter, frequency);
      }

      function stop() {
        isActive = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        el.style.transform = '';
      }

      if (continuous) {
        start();
      } else {
        el.addEventListener('mouseenter', start);
        el.addEventListener('mouseleave', stop);
      }

      cleanups.push(function () {
        stop();
        el.removeEventListener('mouseenter', start);
        el.removeEventListener('mouseleave', stop);
      });
    });

    return {
      destroy: function () { cleanups.forEach(function (fn) { fn(); }); },
    };
  }

  /* ============================================================
     HELPERS
     ============================================================ */

  function resolveElements(target) {
    if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target instanceof NodeList) return Array.from(target);
    if (Array.isArray(target)) return target;
    return [];
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var Distortion = {
    ripple: ripple,
    stretch: stretch,
    noise: noise,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Distortion;
  } else {
    global.Distortion = Distortion;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
