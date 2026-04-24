/**
 * svg-animations.js — Path drawing on scroll, SVG morph, animated icons
 *
 * Usage:
 *   <script src="svg-animations.js"></script>
 *   <script>
 *     // Draw SVG path when scrolled into view
 *     SVGAnim.draw('.svg-draw-scroll', { duration: 2000 });
 *
 *     // Morph between two SVG paths
 *     SVGAnim.morph('#my-path', {
 *       from: 'M10,80 Q50,10 90,80',
 *       to: 'M10,50 Q50,90 90,50',
 *       duration: 1000,
 *     });
 *
 *     // Auto-calculate path lengths for draw animations
 *     SVGAnim.calcPaths('.svg-draw');
 *   </script>
 */

(function (global) {
  'use strict';

  var SVGAnim = {
    /**
     * Auto-calculate and set --path-length for all paths in SVG.
     * Required for CSS draw animations.
     * @param {string|Element|NodeList} target
     */
    calcPaths: function (target) {
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (svg) {
        var paths = svg.querySelectorAll('path, line, polyline, polygon, circle, rect');
        paths.forEach(function (path) {
          if (path.getTotalLength) {
            var length = Math.ceil(path.getTotalLength());
            path.style.setProperty('--path-length', length);
            path.setAttribute('stroke-dasharray', length);
            path.setAttribute('stroke-dashoffset', length);
          }
        });
      });
    },

    /**
     * Draw SVG paths when element scrolls into view.
     * @param {string|Element|NodeList} target — SVG elements
     * @param {object} [opts]
     * @param {number} [opts.duration=2000]
     * @param {string} [opts.easing='ease']
     * @param {number} [opts.threshold=0.3]
     * @param {number} [opts.delay=0]
     * @param {number} [opts.stagger=200] — delay between paths
     */
    draw: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var duration = opts.duration || 2000;
      var easing = opts.easing || 'ease';
      var stagger = opts.stagger || 200;
      var delay = opts.delay || 0;

      Array.from(els).forEach(function (svg) {
        var paths = svg.querySelectorAll('path, line, polyline, polygon, circle, rect');

        // Calculate and set path lengths
        paths.forEach(function (path) {
          if (path.getTotalLength) {
            var length = Math.ceil(path.getTotalLength());
            path.style.setProperty('--path-length', length);
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.transition = 'none';
          }
        });

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              observer.unobserve(svg);

              paths.forEach(function (path, i) {
                setTimeout(function () {
                  path.style.transition = 'stroke-dashoffset ' + duration + 'ms ' + easing;
                  path.style.strokeDashoffset = '0';
                }, delay + i * stagger);
              });
            }
          });
        }, { threshold: opts.threshold || 0.3 });

        observer.observe(svg);
      });
    },

    /**
     * Morph between two SVG path `d` attributes.
     * @param {string|Element} target — path element
     * @param {object} opts
     * @param {string} opts.from — starting path d
     * @param {string} opts.to — ending path d
     * @param {number} [opts.duration=1000]
     * @param {boolean} [opts.loop=false]
     * @param {boolean} [opts.yoyo=true] — reverse on complete
     */
    morph: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var from = opts.from || el.getAttribute('d');
      var to = opts.to;
      if (!from || !to) return;

      var duration = opts.duration || 1000;
      var loop = opts.loop || false;
      var yoyo = opts.yoyo !== false;
      var forward = true;

      function animate() {
        el.style.transition = 'd ' + duration + 'ms ease-in-out';

        // Use WAAPI if available
        if (el.animate) {
          var keyframes = forward
            ? [{ d: 'path("' + from + '")' }, { d: 'path("' + to + '")' }]
            : [{ d: 'path("' + to + '")' }, { d: 'path("' + from + '")' }];

          var anim = el.animate(keyframes, {
            duration: duration,
            fill: 'forwards',
            easing: 'ease-in-out',
          });

          anim.onfinish = function () {
            if (yoyo) forward = !forward;
            if (loop) animate();
          };
        } else {
          // Fallback: just set the attribute
          el.setAttribute('d', forward ? to : from);
          if (yoyo) forward = !forward;
          if (loop) setTimeout(animate, duration);
        }
      }

      animate();

      return {
        stop: function () { loop = false; },
      };
    },

    /**
     * Animate SVG icon interactions (check, X, arrow transitions).
     * @param {string|Element} target — SVG icon container
     * @param {object} [opts]
     * @param {string} [opts.animation='draw'] — draw, pulse, bounce
     * @param {number} [opts.duration=500]
     */
    animateIcon: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var animation = opts.animation || 'draw';
      var duration = opts.duration || 500;

      if (animation === 'draw') {
        SVGAnim.calcPaths(el);
        var paths = el.querySelectorAll('path, line, polyline');
        paths.forEach(function (path, i) {
          path.style.transition = 'stroke-dashoffset ' + duration + 'ms ease ' + (i * 100) + 'ms';
          requestAnimationFrame(function () {
            path.style.strokeDashoffset = '0';
          });
        });
      } else if (animation === 'pulse') {
        el.style.transition = 'transform ' + duration + 'ms ease';
        el.style.transform = 'scale(1.2)';
        setTimeout(function () {
          el.style.transform = 'scale(1)';
        }, duration);
      } else if (animation === 'bounce') {
        el.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'scale(0)';
        requestAnimationFrame(function () {
          el.style.transform = 'scale(1)';
        });
      }
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SVGAnim;
  } else {
    global.SVGAnim = SVGAnim;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
