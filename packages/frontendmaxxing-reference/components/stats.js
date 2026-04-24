/**
 * stats.js — Scroll-triggered number counting animation
 *
 * Usage:
 *   <script src="stats.js"></script>
 *   <script>
 *     // Auto-bind all [data-count-to] elements
 *     Stats.init();
 *
 *     // Or manually
 *     Stats.countUp('#counter', { to: 1500, duration: 2000, suffix: '+' });
 *   </script>
 */

(function (global) {
  'use strict';

  var Stats = {
    /**
     * Auto-initialize all elements with data-count-to attribute.
     * Triggers counting animation when element enters viewport.
     * @param {object} [opts]
     * @param {number} [opts.duration=2000]
     * @param {number} [opts.threshold=0.3]
     */
    init: function (opts) {
      opts = opts || {};
      var els = document.querySelectorAll('[data-count-to]');

      if (!els.length) return;

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            observer.unobserve(el);

            Stats.countUp(el, {
              from: parseFloat(el.dataset.countFrom) || 0,
              to: parseFloat(el.dataset.countTo),
              duration: parseFloat(el.dataset.countDuration) || opts.duration || 2000,
              prefix: el.dataset.countPrefix || '',
              suffix: el.dataset.countSuffix || '',
              decimals: parseInt(el.dataset.countDecimals) || 0,
              separator: el.dataset.countSeparator !== undefined ? el.dataset.countSeparator : ',',
            });
          }
        });
      }, { threshold: opts.threshold || 0.3 });

      els.forEach(function (el) { observer.observe(el); });
    },

    /**
     * Animate a number counting up.
     * @param {string|Element} target
     * @param {object} opts
     * @param {number} [opts.from=0]
     * @param {number} opts.to — target number
     * @param {number} [opts.duration=2000] — animation duration in ms
     * @param {string} [opts.prefix=''] — text before number (e.g., '$')
     * @param {string} [opts.suffix=''] — text after number (e.g., '+', 'K')
     * @param {number} [opts.decimals=0] — decimal places
     * @param {string} [opts.separator=','] — thousands separator ('' to disable)
     * @param {function} [opts.easing] — easing function (default: easeOutExpo)
     * @param {function} [opts.onComplete]
     */
    countUp: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var from = opts.from || 0;
      var to = opts.to;
      if (to === undefined) return;

      var duration = opts.duration || 2000;
      var prefix = opts.prefix || '';
      var suffix = opts.suffix || '';
      var decimals = opts.decimals || 0;
      var separator = opts.separator !== undefined ? opts.separator : ',';

      // Easing function (default: easeOutExpo)
      var easing = opts.easing || function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };

      function formatNumber(n) {
        var fixed = n.toFixed(decimals);
        if (!separator) return prefix + fixed + suffix;

        var parts = fixed.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        return prefix + parts.join('.') + suffix;
      }

      var startTime = null;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easedProgress = easing(progress);
        var current = from + (to - from) * easedProgress;

        el.textContent = formatNumber(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = formatNumber(to);
          if (opts.onComplete) opts.onComplete();
        }
      }

      requestAnimationFrame(animate);
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stats;
  } else {
    global.Stats = Stats;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
