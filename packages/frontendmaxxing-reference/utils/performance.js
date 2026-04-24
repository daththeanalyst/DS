/**
 * performance.js — throttle, debounce, rAF wrapper, will-change management
 *
 * Usage:
 *   <script src="performance.js"></script>
 *   <script>
 *     // Throttle scroll handler to 60fps
 *     window.addEventListener('scroll', Perf.throttle(handler, 16));
 *
 *     // Debounce resize handler
 *     window.addEventListener('resize', Perf.debounce(handler, 250));
 *
 *     // rAF-based throttle (best for animations)
 *     window.addEventListener('mousemove', Perf.rafThrottle(handler));
 *
 *     // will-change management
 *     Perf.willChange(element, 'transform');
 *     // ... do animation ...
 *     Perf.willChangeRemove(element);
 *   </script>
 */

(function (global) {
  'use strict';

  var Perf = {
    /**
     * Throttle: call at most once per `delay` ms.
     * @param {function} fn
     * @param {number} delay - Minimum ms between calls
     * @returns {function}
     */
    throttle: function (fn, delay) {
      var lastCall = 0;
      var timeoutId = null;

      return function () {
        var now = Date.now();
        var context = this;
        var args = arguments;
        var remaining = delay - (now - lastCall);

        if (remaining <= 0) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          lastCall = now;
          fn.apply(context, args);
        } else if (!timeoutId) {
          timeoutId = setTimeout(function () {
            lastCall = Date.now();
            timeoutId = null;
            fn.apply(context, args);
          }, remaining);
        }
      };
    },

    /**
     * Debounce: wait until `delay` ms after last call.
     * @param {function} fn
     * @param {number} delay
     * @param {boolean} [immediate=false] - Fire on leading edge
     * @returns {function}
     */
    debounce: function (fn, delay, immediate) {
      var timeoutId = null;

      var debounced = function () {
        var context = this;
        var args = arguments;
        var callNow = immediate && !timeoutId;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          timeoutId = null;
          if (!immediate) fn.apply(context, args);
        }, delay);

        if (callNow) fn.apply(context, args);
      };

      debounced.cancel = function () {
        clearTimeout(timeoutId);
        timeoutId = null;
      };

      return debounced;
    },

    /**
     * requestAnimationFrame throttle: best for visual updates.
     * Ensures the callback fires at most once per frame.
     * @param {function} fn
     * @returns {function}
     */
    rafThrottle: function (fn) {
      var rafId = null;
      var lastArgs = null;

      return function () {
        lastArgs = arguments;
        var context = this;

        if (rafId === null) {
          rafId = requestAnimationFrame(function () {
            rafId = null;
            fn.apply(context, lastArgs);
          });
        }
      };
    },

    /**
     * Run callback on next idle period (or setTimeout fallback).
     * Good for non-urgent work.
     */
    onIdle: function (fn, timeout) {
      if (typeof requestIdleCallback !== 'undefined') {
        return requestIdleCallback(fn, { timeout: timeout || 2000 });
      }
      return setTimeout(fn, 0);
    },

    /**
     * Set will-change on an element (hint to browser for optimization).
     * Call before animation starts.
     * @param {Element} el
     * @param {string} properties - e.g., 'transform', 'opacity', 'transform, opacity'
     */
    willChange: function (el, properties) {
      el.style.willChange = properties || 'transform';
    },

    /**
     * Remove will-change after animation completes.
     * Important: leaving will-change on permanently wastes GPU memory.
     */
    willChangeRemove: function (el) {
      el.style.willChange = 'auto';
    },

    /**
     * Temporarily set will-change, run a function, then clean up.
     * @param {Element} el
     * @param {string} properties
     * @param {function} fn
     */
    withWillChange: function (el, properties, fn) {
      el.style.willChange = properties;
      // Give browser a frame to register the hint
      requestAnimationFrame(function () {
        fn();
        // Clean up after animation (generous timeout)
        setTimeout(function () {
          el.style.willChange = 'auto';
        }, 1000);
      });
    },

    /**
     * Measure execution time.
     * @param {string} label
     * @param {function} fn
     * @returns {*} Return value of fn
     */
    measure: function (label, fn) {
      var start = performance.now();
      var result = fn();
      var end = performance.now();
      console.log(label + ': ' + (end - start).toFixed(2) + 'ms');
      return result;
    },

    /**
     * Simple FPS counter.
     * @returns {{ start, stop, get }}
     */
    fpsCounter: function () {
      var frames = 0;
      var startTime = 0;
      var running = false;
      var rafId;

      function tick() {
        frames++;
        if (running) rafId = requestAnimationFrame(tick);
      }

      return {
        start: function () {
          frames = 0;
          startTime = performance.now();
          running = true;
          rafId = requestAnimationFrame(tick);
        },
        stop: function () {
          running = false;
          if (rafId) cancelAnimationFrame(rafId);
        },
        get: function () {
          var elapsed = (performance.now() - startTime) / 1000;
          return elapsed > 0 ? Math.round(frames / elapsed) : 0;
        },
      };
    },

    /**
     * Batch DOM reads and writes to avoid layout thrashing.
     * Schedule reads for the current frame, writes for the next.
     */
    batchDOM: (function () {
      var reads = [];
      var writes = [];
      var scheduled = false;

      function flush() {
        var r = reads.splice(0);
        var w = writes.splice(0);
        r.forEach(function (fn) { fn(); });
        w.forEach(function (fn) { fn(); });
        scheduled = false;
        if (reads.length || writes.length) schedule();
      }

      function schedule() {
        if (!scheduled) {
          scheduled = true;
          requestAnimationFrame(flush);
        }
      }

      return {
        read: function (fn) { reads.push(fn); schedule(); },
        write: function (fn) { writes.push(fn); schedule(); },
      };
    })(),
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Perf;
  } else {
    global.Perf = Perf;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
