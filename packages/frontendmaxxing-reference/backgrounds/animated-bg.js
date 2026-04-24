/**
 * animated-bg.js — Spotlight cursor, interactive gradient, wave background
 *
 * Usage:
 *   <script src="animated-bg.js"></script>
 *   <script>
 *     // Cursor-following spotlight
 *     AnimatedBG.spotlight('#my-section');
 *
 *     // Mouse-reactive gradient
 *     AnimatedBG.interactiveGradient('#hero', {
 *       colors: ['#667eea', '#764ba2', '#f093fb'],
 *     });
 *
 *     // Canvas wave background
 *     AnimatedBG.waves('#wave-canvas', { color: '#818cf8', speed: 0.02 });
 *   </script>
 */

(function (global) {
  'use strict';

  var AnimatedBG = {
    /**
     * Cursor-following radial spotlight effect.
     * @param {string|Element} target
     * @param {object} [opts]
     * @param {number} [opts.size=400] — spotlight diameter in px
     * @param {string} [opts.color='rgba(129,140,248,0.08)']
     */
    spotlight: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var size = opts.size || 400;
      var color = opts.color || 'rgba(129,140,248,0.08)';

      el.style.position = el.style.position || 'relative';

      var spot = document.createElement('div');
      spot.style.cssText =
        'position:absolute;inset:0;pointer-events:none;z-index:0;' +
        'background:radial-gradient(' + size + 'px circle at var(--spot-x, 50%) var(--spot-y, 50%), ' + color + ', transparent 60%);' +
        'opacity:0;transition:opacity 0.3s ease;';
      el.appendChild(spot);

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        spot.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
        spot.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
        spot.style.opacity = '1';
      });

      el.addEventListener('mouseleave', function () {
        spot.style.opacity = '0';
      });
    },

    /**
     * Interactive gradient that reacts to mouse position.
     * @param {string|Element} target
     * @param {object} [opts]
     * @param {string[]} [opts.colors=['#667eea','#764ba2','#f093fb']]
     */
    interactiveGradient: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var colors = opts.colors || ['#667eea', '#764ba2', '#f093fb'];

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);

        el.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, ' +
          colors.join(', ') + ')';
      });

      el.addEventListener('mouseleave', function () {
        el.style.background = 'radial-gradient(circle at 50% 50%, ' +
          colors.join(', ') + ')';
      });
    },

    /**
     * Canvas-based animated wave background.
     * @param {string|Element} canvas — canvas element
     * @param {object} [opts]
     * @param {string} [opts.color='#818cf8']
     * @param {number} [opts.speed=0.02]
     * @param {number} [opts.amplitude=40]
     * @param {number} [opts.frequency=0.01]
     * @param {number} [opts.layers=3]
     * @param {number} [opts.opacity=0.15]
     */
    waves: function (canvas, opts) {
      opts = opts || {};
      var el = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
      if (!el || el.tagName !== 'CANVAS') return;

      var ctx = el.getContext('2d');
      var speed = opts.speed || 0.02;
      var amplitude = opts.amplitude || 40;
      var frequency = opts.frequency || 0.01;
      var layers = opts.layers || 3;
      var baseOpacity = opts.opacity || 0.15;

      // Parse color
      var color = opts.color || '#818cf8';
      function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        } : { r: 129, g: 140, b: 248 };
      }
      var rgb = hexToRgb(color);

      var time = 0;
      var running = true;

      function resize() {
        el.width = el.offsetWidth * (window.devicePixelRatio || 1);
        el.height = el.offsetHeight * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }

      function draw() {
        if (!running) return;

        var w = el.offsetWidth;
        var h = el.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        for (var l = 0; l < layers; l++) {
          var layerOffset = l * 0.4;
          var layerAmplitude = amplitude * (1 - l * 0.2);
          var layerOpacity = baseOpacity * (1 - l * 0.25);

          ctx.beginPath();
          ctx.moveTo(0, h);

          for (var x = 0; x <= w; x += 2) {
            var y = h * 0.6 +
              Math.sin(x * frequency + time + layerOffset) * layerAmplitude +
              Math.sin(x * frequency * 0.5 + time * 0.7 + layerOffset) * layerAmplitude * 0.5;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(w, h);
          ctx.closePath();

          ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + layerOpacity + ')';
          ctx.fill();
        }

        time += speed;
        requestAnimationFrame(draw);
      }

      resize();
      window.addEventListener('resize', resize);
      draw();

      return {
        stop: function () { running = false; },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedBG;
  } else {
    global.AnimatedBG = AnimatedBG;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
