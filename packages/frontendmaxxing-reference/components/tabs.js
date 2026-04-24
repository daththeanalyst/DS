/**
 * tabs.js — Tab switching, sliding underline indicator, keyboard nav
 *
 * Usage:
 *   <script src="tabs.js"></script>
 *   <script>
 *     Tabs.init('.tabs-underline');
 *     // or
 *     Tabs.init('.tabs-pill', { onChange: (index) => console.log(index) });
 *   </script>
 */

(function (global) {
  'use strict';

  var Tabs = {
    /**
     * Initialize tab component.
     * @param {string|Element} target — tabs container
     * @param {object} [opts]
     * @param {function} [opts.onChange] — called with active tab index
     * @param {boolean} [opts.keyboard=true] — arrow key navigation
     */
    init: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var tabList = el.querySelector('.tab-list');
      var tabs = el.querySelectorAll('.tab');
      var panels = el.querySelectorAll('.tab-panel');
      var indicator = el.querySelector('.tab-indicator');
      var isVertical = el.classList.contains('tabs-vertical');

      function activate(index) {
        tabs.forEach(function (t, i) {
          t.classList.toggle('active', i === index);
          t.setAttribute('aria-selected', i === index);
          t.setAttribute('tabindex', i === index ? '0' : '-1');
        });

        panels.forEach(function (p, i) {
          p.classList.toggle('active', i === index);
        });

        // Move sliding indicator
        if (indicator && tabs[index]) {
          var tab = tabs[index];
          if (isVertical) {
            indicator.style.top = tab.offsetTop + 'px';
            indicator.style.height = tab.offsetHeight + 'px';
          } else {
            indicator.style.left = tab.offsetLeft + 'px';
            indicator.style.width = tab.offsetWidth + 'px';
          }
        }

        if (opts.onChange) opts.onChange(index);
      }

      // Click handlers
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () {
          activate(i);
        });
      });

      // Keyboard navigation
      if (opts.keyboard !== false) {
        tabList.addEventListener('keydown', function (e) {
          var current = Array.from(tabs).indexOf(document.activeElement);
          if (current === -1) return;

          var next = current;
          var prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
          var nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

          if (e.key === nextKey) {
            next = (current + 1) % tabs.length;
            e.preventDefault();
          } else if (e.key === prevKey) {
            next = (current - 1 + tabs.length) % tabs.length;
            e.preventDefault();
          } else if (e.key === 'Home') {
            next = 0;
            e.preventDefault();
          } else if (e.key === 'End') {
            next = tabs.length - 1;
            e.preventDefault();
          }

          if (next !== current) {
            activate(next);
            tabs[next].focus();
          }
        });
      }

      // Initialize first active tab
      var activeIndex = Array.from(tabs).findIndex(function (t) {
        return t.classList.contains('active');
      });
      activate(activeIndex >= 0 ? activeIndex : 0);

      // Re-position indicator on resize
      var resizeObserver;
      if (typeof ResizeObserver !== 'undefined' && indicator) {
        resizeObserver = new ResizeObserver(function () {
          var idx = Array.from(tabs).findIndex(function (t) {
            return t.classList.contains('active');
          });
          if (idx >= 0) activate(idx);
        });
        resizeObserver.observe(tabList);
      }

      return {
        activate: activate,
        destroy: function () {
          if (resizeObserver) resizeObserver.disconnect();
        },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tabs;
  } else {
    global.Tabs = Tabs;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
