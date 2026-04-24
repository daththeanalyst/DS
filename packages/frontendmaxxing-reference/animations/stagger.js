/**
 * stagger.js — Staggered entrance animations for lists and grids
 *
 * Usage:
 *   <script src="stagger.js"></script>
 *   <script>
 *     // Stagger with CSS class (pairs with keyframes.css)
 *     Stagger.entrance('.card', {
 *       animation: 'animate-fadeInUp',
 *       delay: 80,       // ms between each element
 *       from: 'first',   // 'first' | 'last' | 'center' | 'random'
 *     });
 *
 *     // Stagger with inline transforms
 *     Stagger.transform('.list-item', {
 *       from: { y: 30, opacity: 0 },
 *       to: { y: 0, opacity: 1 },
 *       delay: 60,
 *       duration: 500,
 *       easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
 *     });
 *
 *     // Grid stagger (2D wave from top-left)
 *     Stagger.grid('.grid-item', {
 *       columns: 4,
 *       animation: 'animate-scaleIn',
 *       delay: 50,
 *     });
 *   </script>
 *
 * No dependencies. Respects prefers-reduced-motion.
 */

(function (global) {
  'use strict';

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     ENTRANCE STAGGER (CSS class based)
     ============================================================ */

  /**
   * Stagger entrance by adding a CSS animation class with incrementing delays.
   * @param {string|NodeList|Element[]} target
   * @param {Object} opts
   * @param {string} [opts.animation='animate-fadeInUp'] - CSS class to apply
   * @param {number} [opts.delay=80]  - Delay between each element (ms)
   * @param {string} [opts.from='first'] - Order: 'first' | 'last' | 'center' | 'random'
   * @param {boolean} [opts.once=true]   - Remove class after animation ends
   * @returns {{ cancel: function }}
   */
  function entrance(target, opts) {
    opts = opts || {};
    const animClass = opts.animation || 'animate-fadeInUp';
    const delay = opts.delay ?? 80;
    const from = opts.from || 'first';
    const once = opts.once !== false;

    const elements = resolveElements(target);

    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.style.opacity = '1';
        el.classList.add(animClass);
      });
      return { cancel: function () {} };
    }

    // Set initial hidden state
    elements.forEach(function (el) {
      el.style.opacity = '0';
    });

    const ordered = orderElements(elements, from);
    const timeouts = [];

    ordered.forEach(function (el, i) {
      const t = setTimeout(function () {
        el.style.opacity = '';
        el.classList.add(animClass);

        if (once) {
          el.addEventListener(
            'animationend',
            function handler() {
              el.removeEventListener('animationend', handler);
            },
            { once: true }
          );
        }
      }, i * delay);
      timeouts.push(t);
    });

    return {
      cancel: function () {
        timeouts.forEach(clearTimeout);
      },
    };
  }

  /* ============================================================
     TRANSFORM STAGGER (inline style based)
     ============================================================ */

  /**
   * Stagger elements using Web Animations API or inline transitions.
   * @param {string|NodeList|Element[]} target
   * @param {Object} opts
   * @param {Object} [opts.from={ y: 30, opacity: 0 }]
   * @param {Object} [opts.to={ y: 0, opacity: 1 }]
   * @param {number} [opts.delay=60]     - Stagger delay between elements
   * @param {number} [opts.duration=500] - Animation duration per element
   * @param {string} [opts.easing='cubic-bezier(0.22, 1, 0.36, 1)']
   * @param {string} [opts.from_order='first']
   * @returns {{ cancel: function }}
   */
  function transform(target, opts) {
    opts = opts || {};
    const fromState = opts.from || { y: 30, opacity: 0 };
    const toState = opts.to || { y: 0, opacity: 1 };
    const delay = opts.delay ?? 60;
    const duration = opts.duration ?? 500;
    const easing = opts.easing || 'cubic-bezier(0.22, 1, 0.36, 1)';
    const fromOrder = opts.from_order || 'first';

    const elements = resolveElements(target);

    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        applyState(el, toState);
      });
      return { cancel: function () {} };
    }

    // Set initial state
    elements.forEach(function (el) {
      applyState(el, fromState);
    });

    const ordered = orderElements(elements, fromOrder);
    const animations = [];

    ordered.forEach(function (el, i) {
      const fromKeyframe = stateToKeyframe(fromState);
      const toKeyframe = stateToKeyframe(toState);

      const anim = el.animate([fromKeyframe, toKeyframe], {
        duration: duration,
        delay: i * delay,
        easing: easing,
        fill: 'forwards',
      });
      animations.push(anim);
    });

    return {
      cancel: function () {
        animations.forEach(function (a) {
          a.cancel();
        });
      },
    };
  }

  /* ============================================================
     GRID STAGGER (2D wave effect)
     ============================================================ */

  /**
   * Stagger in a 2D grid pattern (wave from corner/center).
   * @param {string|NodeList|Element[]} target
   * @param {Object} opts
   * @param {number} opts.columns          - Number of grid columns
   * @param {string} [opts.animation='animate-scaleIn']
   * @param {number} [opts.delay=50]       - Base delay per distance unit
   * @param {string} [opts.origin='top-left'] - Wave origin: 'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center'
   * @returns {{ cancel: function }}
   */
  function grid(target, opts) {
    opts = opts || {};
    const columns = opts.columns || 4;
    const animClass = opts.animation || 'animate-scaleIn';
    const baseDelay = opts.delay ?? 50;
    const origin = opts.origin || 'top-left';

    const elements = resolveElements(target);

    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.style.opacity = '1';
        el.classList.add(animClass);
      });
      return { cancel: function () {} };
    }

    // Set initial state
    elements.forEach(function (el) {
      el.style.opacity = '0';
    });

    const rows = Math.ceil(elements.length / columns);

    // Calculate origin coordinates
    let originRow, originCol;
    switch (origin) {
      case 'top-left':     originRow = 0; originCol = 0; break;
      case 'top-right':    originRow = 0; originCol = columns - 1; break;
      case 'bottom-left':  originRow = rows - 1; originCol = 0; break;
      case 'bottom-right': originRow = rows - 1; originCol = columns - 1; break;
      case 'center':
        originRow = Math.floor(rows / 2);
        originCol = Math.floor(columns / 2);
        break;
      default:
        originRow = 0; originCol = 0;
    }

    const timeouts = [];

    elements.forEach(function (el, i) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      const distance = Math.abs(row - originRow) + Math.abs(col - originCol);
      const delay = distance * baseDelay;

      const t = setTimeout(function () {
        el.style.opacity = '';
        el.classList.add(animClass);
      }, delay);
      timeouts.push(t);
    });

    return {
      cancel: function () {
        timeouts.forEach(clearTimeout);
      },
    };
  }

  /* ============================================================
     HELPERS
     ============================================================ */

  function resolveElements(target) {
    if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (target instanceof NodeList) return Array.from(target);
    if (Array.isArray(target)) return target;
    return [];
  }

  function orderElements(elements, from) {
    var arr = elements.slice();
    switch (from) {
      case 'last':   return arr.reverse();
      case 'center': return orderFromCenter(arr);
      case 'random': return shuffle(arr);
      default:       return arr; // 'first'
    }
  }

  function orderFromCenter(arr) {
    var result = [];
    var mid = Math.floor(arr.length / 2);
    var left = mid - 1;
    var right = mid;
    while (left >= 0 || right < arr.length) {
      if (right < arr.length) result.push(arr[right++]);
      if (left >= 0) result.push(arr[left--]);
    }
    return result;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function applyState(el, state) {
    var transforms = [];
    if (state.x !== undefined || state.y !== undefined) {
      transforms.push(
        'translate3d(' + (state.x || 0) + 'px, ' + (state.y || 0) + 'px, 0)'
      );
    }
    if (state.rotate !== undefined) transforms.push('rotate(' + state.rotate + 'deg)');
    if (state.scale !== undefined) transforms.push('scale(' + state.scale + ')');
    if (transforms.length > 0) el.style.transform = transforms.join(' ');
    if (state.opacity !== undefined) el.style.opacity = String(state.opacity);
  }

  function stateToKeyframe(state) {
    var kf = {};
    var transforms = [];
    if (state.x !== undefined || state.y !== undefined) {
      transforms.push(
        'translate3d(' + (state.x || 0) + 'px, ' + (state.y || 0) + 'px, 0)'
      );
    }
    if (state.rotate !== undefined) transforms.push('rotate(' + state.rotate + 'deg)');
    if (state.scale !== undefined) transforms.push('scale(' + state.scale + ')');
    if (transforms.length > 0) kf.transform = transforms.join(' ');
    if (state.opacity !== undefined) kf.opacity = state.opacity;
    return kf;
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var Stagger = {
    entrance: entrance,
    transform: transform,
    grid: grid,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stagger;
  } else {
    global.Stagger = Stagger;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
