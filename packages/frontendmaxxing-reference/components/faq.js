/**
 * faq.js — Accordion expand/collapse with smooth height animation
 *
 * Usage:
 *   <script src="faq.js"></script>
 *   <script>
 *     FAQ.init('.faq-accordion');
 *     // or single-open mode (accordion)
 *     FAQ.init('.faq-accordion', { single: true });
 *   </script>
 */

(function (global) {
  'use strict';

  var FAQ = {
    /**
     * Initialize FAQ accordion.
     * @param {string|Element} target — .faq-accordion container
     * @param {object} [opts]
     * @param {boolean} [opts.single=false] — only allow one item open at a time
     * @param {function} [opts.onChange] — called with (item, isOpen)
     */
    init: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var items = el.querySelectorAll('.faq-item');
      var single = opts.single || false;

      items.forEach(function (item) {
        var trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
          var isOpen = item.classList.contains('active');

          if (single && !isOpen) {
            // Close all others
            items.forEach(function (other) {
              if (other !== item) other.classList.remove('active');
            });
          }

          item.classList.toggle('active');

          if (opts.onChange) {
            opts.onChange(item, !isOpen);
          }
        });
      });

      return {
        openAll: function () {
          items.forEach(function (item) { item.classList.add('active'); });
        },
        closeAll: function () {
          items.forEach(function (item) { item.classList.remove('active'); });
        },
        toggle: function (index) {
          if (items[index]) items[index].classList.toggle('active');
        },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FAQ;
  } else {
    global.FAQ = FAQ;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
