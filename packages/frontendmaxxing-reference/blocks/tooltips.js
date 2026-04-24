/**
 * tooltips.js — Tooltip show/hide with smart positioning
 *
 * Usage:
 *   <script src="tooltips.js"></script>
 *   <script>
 *     // Auto-bind all [data-tooltip] elements
 *     Tooltip.init();
 *
 *     // Programmatic tooltip
 *     Tooltip.attach('#my-element', {
 *       content: 'Hello!',
 *       position: 'top',
 *       delay: 200,
 *     });
 *   </script>
 */

(function (global) {
  'use strict';

  var activeTooltip = null;

  var Tooltip = {
    /**
     * Auto-bind tooltips to all [data-tooltip] elements.
     * Uses CSS tooltips by default. Call this only if you need JS positioning.
     * @param {object} [opts]
     * @param {number} [opts.delay=200]
     * @param {number} [opts.offset=8]
     */
    init: function (opts) {
      opts = opts || {};
      var els = document.querySelectorAll('[data-tooltip]');
      Array.from(els).forEach(function (el) {
        Tooltip.attach(el, {
          content: el.dataset.tooltip,
          position: el.dataset.tooltipPos || 'top',
          delay: opts.delay,
          offset: opts.offset,
        });
      });
    },

    /**
     * Attach tooltip to an element.
     * @param {string|Element} target
     * @param {object} opts
     * @param {string} opts.content — tooltip text
     * @param {string} [opts.position='top'] — top, bottom, left, right
     * @param {number} [opts.delay=200] — show delay in ms
     * @param {number} [opts.offset=8] — distance from element
     * @param {string} [opts.trigger='hover'] — hover or click
     */
    attach: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var content = opts.content || '';
      var position = opts.position || 'top';
      var delay = opts.delay || 200;
      var offset = opts.offset || 8;
      var trigger = opts.trigger || 'hover';

      var tooltipEl = null;
      var showTimeout = null;

      function createTooltip() {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-popup';
        tooltipEl.textContent = content;
        document.body.appendChild(tooltipEl);
      }

      function positionTooltip() {
        if (!tooltipEl) return;
        var rect = el.getBoundingClientRect();
        var tipRect = tooltipEl.getBoundingClientRect();
        var x, y;

        switch (position) {
          case 'bottom':
            x = rect.left + rect.width / 2 - tipRect.width / 2;
            y = rect.bottom + offset;
            break;
          case 'left':
            x = rect.left - tipRect.width - offset;
            y = rect.top + rect.height / 2 - tipRect.height / 2;
            break;
          case 'right':
            x = rect.right + offset;
            y = rect.top + rect.height / 2 - tipRect.height / 2;
            break;
          default: // top
            x = rect.left + rect.width / 2 - tipRect.width / 2;
            y = rect.top - tipRect.height - offset;
        }

        // Keep within viewport
        var pad = 8;
        x = Math.max(pad, Math.min(x, window.innerWidth - tipRect.width - pad));
        y = Math.max(pad, Math.min(y, window.innerHeight - tipRect.height - pad));

        tooltipEl.style.left = x + 'px';
        tooltipEl.style.top = y + 'px';
      }

      function show() {
        showTimeout = setTimeout(function () {
          if (activeTooltip) hide.call(null);
          createTooltip();
          positionTooltip();
          requestAnimationFrame(function () {
            if (tooltipEl) tooltipEl.classList.add('visible');
          });
          activeTooltip = tooltipEl;
        }, delay);
      }

      function hide() {
        clearTimeout(showTimeout);
        if (tooltipEl) {
          tooltipEl.classList.remove('visible');
          var el2 = tooltipEl;
          setTimeout(function () {
            if (el2 && el2.parentNode) el2.parentNode.removeChild(el2);
          }, 150);
          tooltipEl = null;
          activeTooltip = null;
        }
      }

      if (trigger === 'click') {
        el.addEventListener('click', function () {
          if (tooltipEl) { hide(); } else { show(); }
        });
        document.addEventListener('click', function (e) {
          if (tooltipEl && !el.contains(e.target)) hide();
        });
      } else {
        el.addEventListener('mouseenter', show);
        el.addEventListener('mouseleave', hide);
        el.addEventListener('focus', show);
        el.addEventListener('blur', hide);
      }

      return { show: show, hide: hide };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tooltip;
  } else {
    global.Tooltip = Tooltip;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
