/**
 * loaders.js — Skeleton screen generator, progress bar API, top bar
 *
 * Usage:
 *   <script src="loaders.js"></script>
 *   <script>
 *     // Generate skeleton screen
 *     Loaders.skeleton('#container', { rows: 3, avatar: true, image: true });
 *
 *     // Animate progress bar
 *     Loaders.progress('#my-progress', { to: 75, duration: 800 });
 *
 *     // Page-load top bar
 *     var bar = Loaders.topBar();
 *     bar.start();
 *     fetch('/api/data').then(() => bar.done()).catch(() => bar.fail());
 *   </script>
 */

(function (global) {
  'use strict';

  var Loaders = {
    /**
     * Generate skeleton placeholder content.
     * @param {string|Element} target — container to fill
     * @param {object} [opts]
     * @param {number} [opts.rows=3] — text rows
     * @param {boolean} [opts.avatar=false] — show avatar circle
     * @param {boolean} [opts.image=false] — show image placeholder
     * @param {boolean} [opts.button=false] — show button placeholder
     */
    skeleton: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var rows = opts.rows || 3;
      var html = '';

      if (opts.image) {
        html += '<div class="skeleton skeleton-image" style="margin-bottom:1rem;"></div>';
      }

      if (opts.avatar) {
        html += '<div style="display:flex;gap:0.75rem;align-items:center;margin-bottom:1rem;">';
        html += '<div class="skeleton skeleton-avatar"></div>';
        html += '<div style="flex:1;">';
        html += '<div class="skeleton skeleton-text" style="width:40%;height:0.875em;"></div>';
        html += '<div class="skeleton skeleton-text" style="width:25%;height:0.75em;margin-bottom:0;"></div>';
        html += '</div></div>';
      }

      for (var i = 0; i < rows; i++) {
        var width = i === rows - 1 ? '60%' : (85 + Math.random() * 15) + '%';
        html += '<div class="skeleton skeleton-text" style="width:' + width + ';"></div>';
      }

      if (opts.button) {
        html += '<div class="skeleton skeleton-button" style="margin-top:0.5rem;"></div>';
      }

      el.innerHTML = html;

      return {
        remove: function () {
          el.innerHTML = '';
        },
      };
    },

    /**
     * Animate a progress bar to a value.
     * @param {string|Element} target — .progress-bar element
     * @param {object} opts
     * @param {number} opts.to — target percentage (0-100)
     * @param {number} [opts.duration=400]
     * @param {function} [opts.onComplete]
     */
    progress: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var to = opts.to || 0;
      var duration = opts.duration || 400;

      el.style.setProperty('--progress', '0%');

      requestAnimationFrame(function () {
        el.style.transition = 'none';
        requestAnimationFrame(function () {
          el.style.setProperty('--progress', to + '%');
          if (opts.onComplete) {
            setTimeout(opts.onComplete, duration);
          }
        });
      });
    },

    /**
     * Create a top-of-page loading bar.
     * @param {object} [opts]
     * @param {string} [opts.color] — bar color
     * @param {number} [opts.height=3] — bar height in px
     * @returns {{ start, done, fail, set }}
     */
    topBar: function (opts) {
      opts = opts || {};
      var bar = null;
      var progress = 0;
      var intervalId = null;

      function create() {
        if (bar) return;
        bar = document.createElement('div');
        bar.style.cssText =
          'position:fixed;top:0;left:0;width:0%;height:' + (opts.height || 3) + 'px;' +
          'background:' + (opts.color || 'var(--primary, #818cf8)') + ';' +
          'z-index:99999;transition:width 0.3s ease;' +
          'box-shadow:0 0 10px ' + (opts.color || 'rgba(129,140,248,0.5)') + ';';
        document.body.appendChild(bar);
      }

      function remove() {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        if (bar) {
          bar.style.opacity = '0';
          bar.style.transition = 'opacity 0.3s ease';
          setTimeout(function () {
            if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
            bar = null;
            progress = 0;
          }, 300);
        }
      }

      return {
        start: function () {
          create();
          progress = 0;
          bar.style.width = '0%';
          bar.style.opacity = '1';

          // Trickle: fast at first, slowing as it approaches 90%
          intervalId = setInterval(function () {
            if (progress < 30) {
              progress += 3;
            } else if (progress < 60) {
              progress += 1.5;
            } else if (progress < 85) {
              progress += 0.5;
            } else if (progress < 95) {
              progress += 0.1;
            }
            if (bar) bar.style.width = progress + '%';
          }, 100);
        },

        done: function () {
          if (bar) {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
            bar.style.width = '100%';
            setTimeout(remove, 300);
          }
        },

        fail: function () {
          if (bar) {
            bar.style.background = '#ef4444';
            bar.style.boxShadow = '0 0 10px rgba(239,68,68,0.5)';
            setTimeout(remove, 1000);
          }
        },

        set: function (value) {
          create();
          progress = Math.min(value, 100);
          if (bar) bar.style.width = progress + '%';
        },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Loaders;
  } else {
    global.Loaders = Loaders;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
