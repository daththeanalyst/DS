/**
 * interactions.js — Toggle state, like animation, copy-to-clipboard, counters, hamburger
 *
 * Usage:
 *   <script src="interactions.js"></script>
 *   <script>
 *     Micro.toggle('.toggle-ios');
 *     Micro.like('.like-btn');
 *     Micro.copy('.copy-btn');
 *     Micro.counter('.counter-group');
 *     Micro.hamburger('.hamburger-morph');
 *   </script>
 */

(function (global) {
  'use strict';

  var Micro = {
    /**
     * Toggle switch state management.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {function} [opts.onChange] — (isChecked) => void
     */
    toggle: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        var input = el.querySelector('input[type="checkbox"]');
        if (!input) return;

        input.addEventListener('change', function () {
          if (opts.onChange) opts.onChange(input.checked, el);
        });
      });
    },

    /**
     * Like button with heart burst animation.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {function} [opts.onLike] — (isLiked) => void
     * @param {number} [opts.particles=6] — burst particle count
     */
    like: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var particleCount = opts.particles || 6;

      Array.from(els).forEach(function (el) {
        el.addEventListener('click', function () {
          var isLiked = el.classList.toggle('liked');

          // Create burst particles on like
          if (isLiked) {
            for (var i = 0; i < particleCount; i++) {
              var particle = document.createElement('span');
              particle.className = 'like-particle';
              var angle = (360 / particleCount) * i;
              var distance = 20 + Math.random() * 15;
              var px = Math.cos(angle * Math.PI / 180) * distance;
              var py = Math.sin(angle * Math.PI / 180) * distance;
              particle.style.setProperty('--px', px + 'px');
              particle.style.setProperty('--py', py + 'px');
              el.appendChild(particle);

              (function (p) {
                setTimeout(function () {
                  if (p.parentNode) p.parentNode.removeChild(p);
                }, 600);
              })(particle);
            }
          }

          if (opts.onLike) opts.onLike(isLiked, el);
        });
      });
    },

    /**
     * Copy-to-clipboard with visual feedback.
     * @param {string|Element|NodeList} target — .copy-btn elements
     * @param {object} [opts]
     * @param {string} [opts.feedbackText='Copied!']
     * @param {number} [opts.resetDelay=2000]
     */
    copy: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var feedbackText = opts.feedbackText || 'Copied!';
      var resetDelay = opts.resetDelay || 2000;

      Array.from(els).forEach(function (el) {
        el.addEventListener('click', function () {
          // Get text to copy
          var copyTarget = el.dataset.copyTarget;
          var text = '';

          if (copyTarget) {
            var sourceEl = document.querySelector(copyTarget);
            text = sourceEl ? (sourceEl.textContent || sourceEl.value || '') : '';
          } else if (el.dataset.copyText) {
            text = el.dataset.copyText;
          }

          if (!text) return;

          // Copy to clipboard
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
              showFeedback(el);
            });
          } else {
            // Fallback
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showFeedback(el);
          }

          function showFeedback(btn) {
            var originalText = btn.textContent;
            btn.textContent = feedbackText;
            btn.classList.add('copied');

            setTimeout(function () {
              btn.textContent = originalText;
              btn.classList.remove('copied');
            }, resetDelay);
          }
        });
      });
    },

    /**
     * Counter with increment/decrement buttons.
     * @param {string|Element|NodeList} target — .counter-group elements
     * @param {object} [opts]
     * @param {number} [opts.min=0]
     * @param {number} [opts.max=99]
     * @param {number} [opts.step=1]
     * @param {function} [opts.onChange]
     */
    counter: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var min = opts.min !== undefined ? opts.min : 0;
      var max = opts.max !== undefined ? opts.max : 99;
      var step = opts.step || 1;

      Array.from(els).forEach(function (el) {
        var valueEl = el.querySelector('.counter-value');
        var btns = el.querySelectorAll('.counter-btn');
        if (!valueEl || btns.length < 2) return;

        var value = parseInt(valueEl.textContent) || 0;

        function update(newValue) {
          value = Math.max(min, Math.min(max, newValue));
          valueEl.textContent = value;
          if (opts.onChange) opts.onChange(value, el);
        }

        btns[0].addEventListener('click', function () { update(value - step); });
        btns[1].addEventListener('click', function () { update(value + step); });
      });
    },

    /**
     * Hamburger menu icon toggle.
     * @param {string|Element|NodeList} target
     * @param {object} [opts]
     * @param {string|Element} [opts.menu] — menu element to toggle
     * @param {function} [opts.onChange]
     */
    hamburger: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (el) {
        var menuEl = opts.menu
          ? (typeof opts.menu === 'string' ? document.querySelector(opts.menu) : opts.menu)
          : null;

        el.addEventListener('click', function () {
          var isActive = el.classList.toggle('active');
          if (menuEl) menuEl.classList.toggle('open', isActive);
          if (opts.onChange) opts.onChange(isActive, el);
        });
      });
    },

    /**
     * Scroll-triggered count up animation.
     * @param {string|Element|NodeList} target — elements with data-count-to
     * @param {object} [opts]
     * @param {number} [opts.duration=2000]
     */
    countUp: function (target, opts) {
      opts = opts || {};
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      var duration = opts.duration || 2000;

      Array.from(els).forEach(function (el) {
        var to = parseFloat(el.dataset.countTo || el.textContent) || 0;
        var from = 0;
        var startTime = null;

        function animate(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(from + (to - from) * eased);
          if (progress < 1) requestAnimationFrame(animate);
        }

        var observer = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            observer.unobserve(el);
            requestAnimationFrame(animate);
          }
        }, { threshold: 0.5 });

        observer.observe(el);
      });
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Micro;
  } else {
    global.Micro = Micro;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
