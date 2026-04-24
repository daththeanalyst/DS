/**
 * lerp.js — Linear interpolation, map-range, clamp utilities
 *
 * Usage:
 *   <script src="lerp.js"></script>
 *   <script>
 *     MathUtils.lerp(0, 100, 0.5);          // 50
 *     MathUtils.inverseLerp(0, 100, 50);     // 0.5
 *     MathUtils.mapRange(0, 1, 0, 100, 0.5); // 50
 *     MathUtils.clamp(150, 0, 100);           // 100
 *     MathUtils.smoothstep(0, 1, 0.5);        // 0.5 (smooth)
 *     MathUtils.random(10, 20);               // random between 10-20
 *   </script>
 */

(function (global) {
  'use strict';

  var MathUtils = {
    /**
     * Linear interpolation between a and b by factor t.
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Progress (0-1, can overshoot)
     * @returns {number}
     */
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    },

    /**
     * Inverse lerp: find t given a value between a and b.
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} v - Value between a and b
     * @returns {number} Progress (0-1)
     */
    inverseLerp: function (a, b, v) {
      return (b - a) === 0 ? 0 : (v - a) / (b - a);
    },

    /**
     * Map a value from one range to another.
     * @param {number} inMin - Input range start
     * @param {number} inMax - Input range end
     * @param {number} outMin - Output range start
     * @param {number} outMax - Output range end
     * @param {number} value - Input value
     * @returns {number}
     */
    mapRange: function (inMin, inMax, outMin, outMax, value) {
      var t = (value - inMin) / (inMax - inMin);
      return outMin + (outMax - outMin) * t;
    },

    /**
     * Clamp a value between min and max.
     */
    clamp: function (value, min, max) {
      return Math.min(Math.max(value, min), max);
    },

    /**
     * Map with clamping (value stays within output range).
     */
    mapClamped: function (inMin, inMax, outMin, outMax, value) {
      var t = MathUtils.clamp((value - inMin) / (inMax - inMin), 0, 1);
      return outMin + (outMax - outMin) * t;
    },

    /**
     * Smoothstep: smooth Hermite interpolation.
     * Returns 0 for x <= edge0, 1 for x >= edge1.
     */
    smoothstep: function (edge0, edge1, x) {
      var t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    },

    /**
     * Smoother step (Ken Perlin's improvement).
     */
    smootherstep: function (edge0, edge1, x) {
      var t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * t * (t * (t * 6 - 15) + 10);
    },

    /**
     * Damp: frame-rate-independent lerp smoothing.
     * Use in rAF loops for smooth following.
     * @param {number} a - Current value
     * @param {number} b - Target value
     * @param {number} smoothing - Smoothing factor (higher = slower, e.g. 5-25)
     * @param {number} dt - Delta time in seconds
     */
    damp: function (a, b, smoothing, dt) {
      return MathUtils.lerp(a, b, 1 - Math.exp(-smoothing * dt));
    },

    /**
     * Wrap a value within a range (modulo with support for negatives).
     */
    wrap: function (value, min, max) {
      var range = max - min;
      return ((value - min) % range + range) % range + min;
    },

    /**
     * Random number between min and max (inclusive).
     */
    random: function (min, max) {
      return min + Math.random() * (max - min);
    },

    /**
     * Random integer between min and max (inclusive).
     */
    randomInt: function (min, max) {
      return Math.floor(min + Math.random() * (max - min + 1));
    },

    /**
     * Distance between two 2D points.
     */
    distance: function (x1, y1, x2, y2) {
      var dx = x2 - x1;
      var dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Angle in radians between two points.
     */
    angle: function (x1, y1, x2, y2) {
      return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Degrees to radians.
     */
    degToRad: function (deg) {
      return deg * (Math.PI / 180);
    },

    /**
     * Radians to degrees.
     */
    radToDeg: function (rad) {
      return rad * (180 / Math.PI);
    },

    /**
     * Round to N decimal places.
     */
    roundTo: function (value, decimals) {
      var factor = Math.pow(10, decimals || 0);
      return Math.round(value * factor) / factor;
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathUtils;
  } else {
    global.MathUtils = MathUtils;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
