/**
 * easing.js — 20+ easing functions for animation
 *
 * Usage:
 *   <script src="easing.js"></script>
 *   <script>
 *     // Get an easing function by name
 *     const ease = Easing.easeOutCubic;
 *     const value = ease(0.5); // t from 0 to 1, returns eased value
 *
 *     // Use in a rAF loop
 *     const duration = 500;
 *     const start = performance.now();
 *     function animate(now) {
 *       const t = Math.min((now - start) / duration, 1);
 *       const eased = Easing.easeOutBack(t);
 *       element.style.transform = `translateX(${eased * 200}px)`;
 *       if (t < 1) requestAnimationFrame(animate);
 *     }
 *     requestAnimationFrame(animate);
 *
 *     // Custom cubic bezier
 *     const custom = Easing.cubicBezier(0.34, 1.56, 0.64, 1);
 *     custom(0.5); // evaluate at t=0.5
 *   </script>
 *
 * All functions: f(t) → t where t is 0-1 progress.
 */

(function (global) {
  'use strict';

  var Easing = {
    /* Linear */
    linear: function (t) { return t; },

    /* Quadratic */
    easeInQuad: function (t) { return t * t; },
    easeOutQuad: function (t) { return t * (2 - t); },
    easeInOutQuad: function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    /* Cubic */
    easeInCubic: function (t) { return t * t * t; },
    easeOutCubic: function (t) { return (--t) * t * t + 1; },
    easeInOutCubic: function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },

    /* Quartic */
    easeInQuart: function (t) { return t * t * t * t; },
    easeOutQuart: function (t) { return 1 - (--t) * t * t * t; },
    easeInOutQuart: function (t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    },

    /* Quintic */
    easeInQuint: function (t) { return t * t * t * t * t; },
    easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t; },
    easeInOutQuint: function (t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    },

    /* Sine */
    easeInSine: function (t) { return 1 - Math.cos(t * Math.PI / 2); },
    easeOutSine: function (t) { return Math.sin(t * Math.PI / 2); },
    easeInOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },

    /* Exponential */
    easeInExpo: function (t) {
      return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    },
    easeOutExpo: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    easeInOutExpo: function (t) {
      if (t === 0 || t === 1) return t;
      return t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },

    /* Circular */
    easeInCirc: function (t) { return 1 - Math.sqrt(1 - t * t); },
    easeOutCirc: function (t) { return Math.sqrt(1 - (--t) * t); },
    easeInOutCirc: function (t) {
      return t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
    },

    /* Back (overshoot) */
    easeInBack: function (t) {
      var s = 1.70158;
      return t * t * ((s + 1) * t - s);
    },
    easeOutBack: function (t) {
      var s = 1.70158;
      return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    },
    easeInOutBack: function (t) {
      var s = 1.70158 * 1.525;
      if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
      return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },

    /* Elastic */
    easeInElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    easeOutElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
    easeInOutElastic: function (t) {
      if (t === 0 || t === 1) return t;
      t *= 2;
      if (t < 1) {
        return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
      }
      return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
    },

    /* Bounce */
    easeInBounce: function (t) {
      return 1 - Easing.easeOutBounce(1 - t);
    },
    easeOutBounce: function (t) {
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
      }
    },
    easeInOutBounce: function (t) {
      return t < 0.5
        ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
        : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
    },

    /* Custom cubic-bezier approximation */
    cubicBezier: function (x1, y1, x2, y2) {
      // Newton-Raphson approximation of cubic bezier
      return function (t) {
        if (t === 0 || t === 1) return t;

        var ax = 3 * x1 - 3 * x2 + 1;
        var bx = 3 * x2 - 6 * x1;
        var cx = 3 * x1;

        function sampleCurveX(t) { return ((ax * t + bx) * t + cx) * t; }
        function sampleCurveDerivativeX(t) { return (3 * ax * t + 2 * bx) * t + cx; }

        // Solve for t given x using Newton-Raphson
        var guess = t;
        for (var i = 0; i < 8; i++) {
          var currentX = sampleCurveX(guess) - t;
          if (Math.abs(currentX) < 1e-6) break;
          var derivative = sampleCurveDerivativeX(guess);
          if (Math.abs(derivative) < 1e-6) break;
          guess -= currentX / derivative;
        }

        var ay = 3 * y1 - 3 * y2 + 1;
        var by = 3 * y2 - 6 * y1;
        var cy = 3 * y1;

        return ((ay * guess + by) * guess + cy) * guess;
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Easing;
  } else {
    global.Easing = Easing;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
