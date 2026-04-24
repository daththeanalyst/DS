/**
 * timeline.js — Sequence and chain multiple animations with precise timing
 *
 * Usage:
 *   <script src="timeline.js"></script>
 *   <script>
 *     // Create a timeline
 *     const tl = Timeline.create()
 *       .add('.title', { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] }, { duration: 400 })
 *       .add('.subtitle', { opacity: [0, 1] }, { duration: 300, offset: '-=100' })
 *       .add('.cta', { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] }, { duration: 500 })
 *       .play();
 *
 *     // Control
 *     tl.pause();
 *     tl.resume();
 *     tl.reverse();
 *     tl.seek(0.5); // seek to 50%
 *
 *     // Simple sequence helper
 *     Timeline.sequence([
 *       { target: '.a', keyframes: { opacity: [0, 1] }, duration: 300 },
 *       { target: '.b', keyframes: { opacity: [0, 1] }, duration: 300 },
 *     ]);
 *
 *     // Parallel helper
 *     Timeline.parallel([
 *       { target: '.a', keyframes: { opacity: [0, 1] }, duration: 500 },
 *       { target: '.b', keyframes: { transform: ['scale(0)', 'scale(1)'] }, duration: 500 },
 *     ]);
 *   </script>
 *
 * Uses Web Animations API. No dependencies. Respects prefers-reduced-motion.
 */

(function (global) {
  'use strict';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     TIMELINE
     ============================================================ */

  function create() {
    const entries = [];
    let totalDuration = 0;
    let animations = [];
    let isPlaying = false;
    let currentTime = 0;

    const tl = {
      /**
       * Add an animation step.
       * @param {string|Element} target
       * @param {Object} keyframes - Web Animations API keyframe format
       * @param {Object} [opts]
       * @param {number} [opts.duration=400]
       * @param {string} [opts.easing='cubic-bezier(0.22, 1, 0.36, 1)']
       * @param {string|number} [opts.offset] - '+=100', '-=100', or absolute ms
       */
      add: function (target, keyframes, opts) {
        opts = opts || {};
        const duration = opts.duration ?? 400;
        const easing = opts.easing || 'cubic-bezier(0.22, 1, 0.36, 1)';
        const offset = parseOffset(opts.offset, totalDuration);

        entries.push({
          target: target,
          keyframes: keyframes,
          duration: duration,
          easing: easing,
          startTime: offset,
        });

        totalDuration = Math.max(totalDuration, offset + duration);
        return tl;
      },

      play: function () {
        if (prefersReducedMotion) {
          // Skip to final state
          entries.forEach(function (entry) {
            const els = resolveElements(entry.target);
            els.forEach(function (el) {
              applyFinalState(el, entry.keyframes);
            });
          });
          return tl;
        }

        animations = [];

        entries.forEach(function (entry) {
          const els = resolveElements(entry.target);
          els.forEach(function (el) {
            const anim = el.animate(normalizeKeyframes(entry.keyframes), {
              duration: entry.duration,
              delay: entry.startTime,
              easing: entry.easing,
              fill: 'both',
            });
            anim.pause(); // We control playback manually
            animations.push(anim);
          });
        });

        // Play all
        animations.forEach(function (a) { a.play(); });
        isPlaying = true;

        return tl;
      },

      pause: function () {
        animations.forEach(function (a) { a.pause(); });
        isPlaying = false;
        return tl;
      },

      resume: function () {
        animations.forEach(function (a) { a.play(); });
        isPlaying = true;
        return tl;
      },

      reverse: function () {
        animations.forEach(function (a) { a.reverse(); });
        return tl;
      },

      cancel: function () {
        animations.forEach(function (a) { a.cancel(); });
        animations = [];
        isPlaying = false;
        return tl;
      },

      finish: function () {
        animations.forEach(function (a) { a.finish(); });
        isPlaying = false;
        return tl;
      },

      /**
       * Seek to a progress value (0-1).
       */
      seek: function (progress) {
        const time = progress * totalDuration;
        animations.forEach(function (a) {
          a.currentTime = time;
        });
        return tl;
      },

      /**
       * Get total timeline duration.
       */
      get duration() {
        return totalDuration;
      },

      /**
       * Promise that resolves when all animations complete.
       */
      finished: function () {
        return Promise.all(
          animations.map(function (a) { return a.finished; })
        );
      },
    };

    return tl;
  }

  /* ============================================================
     SEQUENCE (sugar for sequential animations)
     ============================================================ */

  /**
   * @param {Array} steps - [{ target, keyframes, duration, easing }]
   * @param {Object} [opts]
   * @param {number} [opts.gap=0] - Gap between steps in ms
   */
  function sequence(steps, opts) {
    opts = opts || {};
    const gap = opts.gap ?? 0;
    const tl = create();

    steps.forEach(function (step, i) {
      const offset = i === 0 ? 0 : '+=' + gap;
      tl.add(step.target, step.keyframes, {
        duration: step.duration ?? 400,
        easing: step.easing,
        offset: offset,
      });
    });

    return tl.play();
  }

  /* ============================================================
     PARALLEL (sugar for simultaneous animations)
     ============================================================ */

  /**
   * @param {Array} items - [{ target, keyframes, duration, easing }]
   */
  function parallel(items) {
    const tl = create();

    items.forEach(function (item) {
      tl.add(item.target, item.keyframes, {
        duration: item.duration ?? 400,
        easing: item.easing,
        offset: 0,
      });
    });

    return tl.play();
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

  /**
   * Parse offset value.
   * '+=200' -> currentEnd + 200
   * '-=100' -> currentEnd - 100
   * 500     -> absolute 500ms
   * undefined -> currentEnd (sequential)
   */
  function parseOffset(offset, currentEnd) {
    if (offset === undefined || offset === null) return currentEnd;
    if (typeof offset === 'number') return offset;
    if (typeof offset === 'string') {
      if (offset.startsWith('+=')) {
        return currentEnd + parseInt(offset.slice(2), 10);
      }
      if (offset.startsWith('-=')) {
        return Math.max(0, currentEnd - parseInt(offset.slice(2), 10));
      }
      return parseInt(offset, 10) || currentEnd;
    }
    return currentEnd;
  }

  /**
   * Normalize keyframes to Web Animations API format.
   * Accepts: { opacity: [0, 1], transform: ['...', '...'] }
   * Returns: [{ opacity: 0, transform: '...' }, { opacity: 1, transform: '...' }]
   */
  function normalizeKeyframes(kf) {
    if (Array.isArray(kf)) return kf;

    // Object format: { prop: [from, to] }
    const keys = Object.keys(kf);
    if (keys.length === 0) return [{}];

    // Determine frame count from first array property
    const frameCount = Array.isArray(kf[keys[0]]) ? kf[keys[0]].length : 2;
    const frames = [];
    for (let i = 0; i < frameCount; i++) {
      const frame = {};
      for (const key of keys) {
        if (Array.isArray(kf[key])) {
          frame[key] = kf[key][i];
        } else {
          frame[key] = kf[key]; // static value for all frames
        }
      }
      frames.push(frame);
    }
    return frames;
  }

  function applyFinalState(el, keyframes) {
    const frames = normalizeKeyframes(keyframes);
    const last = frames[frames.length - 1];
    for (const key of Object.keys(last)) {
      el.style[key] = last[key];
    }
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var Timeline = {
    create: create,
    sequence: sequence,
    parallel: parallel,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timeline;
  } else {
    global.Timeline = Timeline;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
