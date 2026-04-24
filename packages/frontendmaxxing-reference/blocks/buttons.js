/**
 * buttons.js — Ripple effect, magnetic hover, submit state
 *
 * Usage:
 *   <script src="buttons.js"></script>
 *   <script>
 *     // Material-style ripple on click
 *     Buttons.ripple('.btn');
 *
 *     // Magnetic pull toward cursor
 *     Buttons.magnetic('.btn-magnetic', { strength: 0.3 });
 *
 *     // Submit with loading → success state
 *     Buttons.submit('#submit-btn', {
 *       loadingText: 'Sending...',
 *       successText: 'Sent!',
 *       action: () => fetch('/api/submit', { method: 'POST' }),
 *     });
 *   </script>
 */

(function (global) {
  'use strict';

  var Buttons = {
    /**
     * Add material-style ripple effect on click.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {string} [opts.color='rgba(255,255,255,0.35)']
     * @param {number} [opts.duration=600] — ripple duration in ms
     */
    ripple: function (target, opts) {
      opts = opts || {};
      var color = opts.color || 'rgba(255,255,255,0.35)';
      var duration = opts.duration || 600;

      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        el.style.position = el.style.position || 'relative';
        el.style.overflow = 'hidden';

        el.addEventListener('click', function (e) {
          var rect = el.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height) * 2;
          var x = e.clientX - rect.left - size / 2;
          var y = e.clientY - rect.top - size / 2;

          var ripple = document.createElement('span');
          ripple.style.cssText =
            'position:absolute;border-radius:50%;pointer-events:none;' +
            'background:' + color + ';' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'left:' + x + 'px;top:' + y + 'px;' +
            'transform:scale(0);opacity:1;' +
            'transition:transform ' + duration + 'ms ease-out, opacity ' + duration + 'ms ease-out;';

          el.appendChild(ripple);

          // Trigger animation
          requestAnimationFrame(function () {
            ripple.style.transform = 'scale(1)';
            ripple.style.opacity = '0';
          });

          setTimeout(function () {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
          }, duration);
        });
      });
    },

    /**
     * Magnetic pull toward cursor on hover.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {number} [opts.strength=0.3] — pull strength (0-1)
     * @param {number} [opts.radius=100] — activation radius in px
     * @param {number} [opts.ease=0.15] — easing factor
     */
    magnetic: function (target, opts) {
      opts = opts || {};
      var strength = opts.strength || 0.3;
      var radius = opts.radius || 100;
      var ease = opts.ease || 0.15;

      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        var currentX = 0, currentY = 0;
        var targetX = 0, targetY = 0;
        var animating = false;

        function animate() {
          currentX += (targetX - currentX) * ease;
          currentY += (targetY - currentY) * ease;
          el.style.transform = 'translate(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px)';

          if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            requestAnimationFrame(animate);
          } else {
            animating = false;
          }
        }

        function startAnimate() {
          if (!animating) {
            animating = true;
            animate();
          }
        }

        el.addEventListener('mousemove', function (e) {
          var rect = el.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = e.clientX - cx;
          var dy = e.clientY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            targetX = dx * strength;
            targetY = dy * strength;
          } else {
            targetX = 0;
            targetY = 0;
          }
          startAnimate();
        });

        el.addEventListener('mouseleave', function () {
          targetX = 0;
          targetY = 0;
          startAnimate();
        });
      });
    },

    /**
     * Submit button with loading → success/error state.
     * @param {string|Element} target
     * @param {object} opts
     * @param {function} opts.action — async function to execute
     * @param {string} [opts.loadingText='Loading...']
     * @param {string} [opts.successText='Done!']
     * @param {string} [opts.errorText='Error']
     * @param {number} [opts.resetDelay=2000] — ms before resetting to original
     */
    submit: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var loadingText = opts.loadingText || 'Loading...';
      var successText = opts.successText || 'Done!';
      var errorText = opts.errorText || 'Error';
      var resetDelay = opts.resetDelay || 2000;
      var action = opts.action;
      var originalText = el.textContent;
      var isProcessing = false;

      el.addEventListener('click', function (e) {
        if (isProcessing || !action) return;
        e.preventDefault();
        isProcessing = true;

        // Loading state
        el.textContent = loadingText;
        el.classList.add('btn-loading');
        el.disabled = true;

        var result = action();
        var promise = result && typeof result.then === 'function'
          ? result
          : Promise.resolve(result);

        promise
          .then(function () {
            el.classList.remove('btn-loading');
            el.textContent = successText;
            el.style.setProperty('--btn-bg', '#10b981');
          })
          .catch(function () {
            el.classList.remove('btn-loading');
            el.textContent = errorText;
            el.style.setProperty('--btn-bg', '#ef4444');
          })
          .finally(function () {
            setTimeout(function () {
              el.textContent = originalText;
              el.style.removeProperty('--btn-bg');
              el.disabled = false;
              isProcessing = false;
            }, resetDelay);
          });
      });
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Buttons;
  } else {
    global.Buttons = Buttons;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
