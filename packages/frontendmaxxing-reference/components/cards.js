/**
 * cards.js — 3D flip, expand-on-click, hover tilt, spotlight
 *
 * Usage:
 *   <script src="cards.js"></script>
 *   <script>
 *     // 3D flip toggle on click
 *     Cards.flip('.card-flip');
 *
 *     // Expand/collapse on click
 *     Cards.expand('.card-expandable');
 *
 *     // 3D tilt effect on hover
 *     Cards.tilt('.card-tilt', { intensity: 10, glare: true });
 *
 *     // Cursor spotlight effect
 *     Cards.spotlight('.card-spotlight');
 *   </script>
 */

(function (global) {
  'use strict';

  var Cards = {
    /**
     * Toggle 3D flip on click.
     * @param {string|Element|NodeList} target — .card-flip elements
     */
    flip: function (target) {
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        el.addEventListener('click', function () {
          el.classList.toggle('flipped');
        });
      });
    },

    /**
     * Expand/collapse card content on click.
     * @param {string|Element|NodeList} target — .card-expandable elements
     * @param {object} [opts]
     * @param {boolean} [opts.accordion=false] — only allow one open at a time
     */
    expand: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var allEls = Array.from(els);

      allEls.forEach(function (el) {
        var trigger = el.querySelector('.card-expand-trigger') || el.querySelector('.card-body');
        if (!trigger) return;

        trigger.addEventListener('click', function () {
          var isExpanded = el.classList.contains('expanded');

          // Accordion: close others
          if (opts.accordion && !isExpanded) {
            allEls.forEach(function (other) {
              other.classList.remove('expanded');
            });
          }

          el.classList.toggle('expanded');
        });
      });
    },

    /**
     * 3D tilt effect on mouse hover.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {number} [opts.intensity=10] — max tilt angle in degrees
     * @param {boolean} [opts.glare=false] — add glare overlay
     * @param {number} [opts.scale=1.02] — scale on hover
     * @param {boolean} [opts.perspective=true]
     */
    tilt: function (target, opts) {
      opts = opts || {};
      var intensity = opts.intensity || 10;
      var showGlare = opts.glare || false;
      var scale = opts.scale || 1.02;

      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        el.style.transformStyle = 'preserve-3d';
        if (opts.perspective !== false) {
          el.style.perspective = '1000px';
        }

        var glareEl;
        if (showGlare) {
          glareEl = document.createElement('div');
          glareEl.style.cssText =
            'position:absolute;inset:0;border-radius:inherit;' +
            'background:linear-gradient(135deg,rgba(255,255,255,0.2),transparent 60%);' +
            'opacity:0;transition:opacity 0.3s ease;pointer-events:none;z-index:10;';
          el.style.position = 'relative';
          el.appendChild(glareEl);
        }

        el.addEventListener('mousemove', function (e) {
          var rect = el.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width;
          var y = (e.clientY - rect.top) / rect.height;

          var rotateX = (0.5 - y) * intensity * 2;
          var rotateY = (x - 0.5) * intensity * 2;

          el.style.transform =
            'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(' + scale + ')';

          if (glareEl) {
            var angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 90;
            glareEl.style.background =
              'linear-gradient(' + angle + 'deg, rgba(255,255,255,0.15), transparent 60%)';
            glareEl.style.opacity = '1';
          }
        });

        el.addEventListener('mouseleave', function () {
          el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
          el.style.transition = 'transform 0.4s ease';
          if (glareEl) glareEl.style.opacity = '0';

          setTimeout(function () {
            el.style.transition = '';
          }, 400);
        });

        el.addEventListener('mouseenter', function () {
          el.style.transition = '';
        });
      });
    },

    /**
     * Cursor spotlight effect — radial glow follows mouse.
     * Works with .card-spotlight CSS class.
     * @param {string|Element|NodeList} target
     */
    spotlight: function (target) {
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        el.addEventListener('mousemove', function (e) {
          var rect = el.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          el.style.setProperty('--mouse-x', x + 'px');
          el.style.setProperty('--mouse-y', y + 'px');
        });
      });
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Cards;
  } else {
    global.Cards = Cards;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
