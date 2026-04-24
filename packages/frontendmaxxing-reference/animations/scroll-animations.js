/**
 * scroll-animations.js — Scroll-triggered reveals + scroll-scrubbed animations
 *
 * Usage:
 *   <script src="scroll-animations.js"></script>
 *   <script>
 *     // Reveal elements when they enter the viewport
 *     ScrollAnim.reveal('.card', {
 *       animation: 'fadeInUp',  // CSS class to add (from keyframes.css)
 *       threshold: 0.2,        // 20% visible before triggering
 *       stagger: 100,          // ms delay between each element
 *     });
 *
 *     // Scrub an animation based on scroll position
 *     ScrollAnim.scrub(document.querySelector('.hero-image'), {
 *       from: { y: 0, scale: 1, opacity: 1 },
 *       to: { y: -100, scale: 0.9, opacity: 0.5 },
 *     });
 *
 *     // Progress bar tied to scroll
 *     ScrollAnim.progress(document.querySelector('.progress-bar'), {
 *       property: 'scaleX',
 *       from: 0,
 *       to: 1,
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
     REVEAL ON SCROLL (IntersectionObserver)
     ============================================================ */

  /**
   * Reveal elements when they scroll into view.
   * @param {string|Element|NodeList} target - CSS selector or elements
   * @param {Object} [opts]
   * @param {string} [opts.animation='animate-fadeInUp'] - CSS class to add
   * @param {number} [opts.threshold=0.15] - Visibility ratio to trigger (0-1)
   * @param {number} [opts.stagger=0] - Delay between each element (ms)
   * @param {boolean} [opts.once=true] - Only animate once (vs every time in view)
   * @param {string} [opts.rootMargin='0px'] - IntersectionObserver root margin
   * @returns {{ destroy: function }} - Cleanup handle
   */
  function reveal(target, opts) {
    opts = opts || {};
    const animClass = opts.animation || 'animate-fadeInUp';
    const threshold = opts.threshold ?? 0.15;
    const stagger = opts.stagger ?? 0;
    const once = opts.once !== false;
    const rootMargin = opts.rootMargin || '0px';

    const elements = resolveElements(target);

    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.style.opacity = '1';
      });
      return { destroy: function () {} };
    }

    // Set initial hidden state
    elements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.willChange = 'transform, opacity';
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const index = elements.indexOf(el);
            const delay = index * stagger;

            setTimeout(function () {
              el.style.opacity = '';
              el.style.willChange = '';
              el.classList.add(animClass);
            }, delay);

            if (once) observer.unobserve(el);
          } else if (!once) {
            entry.target.classList.remove(animClass);
            entry.target.style.opacity = '0';
          }
        });
      },
      { threshold: threshold, rootMargin: rootMargin }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });

    return {
      destroy: function () {
        observer.disconnect();
      },
    };
  }

  /* ============================================================
     SCROLL SCRUB (position-linked animation)
     ============================================================ */

  /**
   * Link animation progress to scroll position of an element.
   * @param {Element} el - Target element
   * @param {Object} opts
   * @param {Object} opts.from - Start values { x, y, scale, rotate, opacity }
   * @param {Object} opts.to   - End values
   * @param {string} [opts.start='top bottom'] - When scrubbing starts: 'elementEdge viewportEdge'
   * @param {string} [opts.end='bottom top']   - When scrubbing ends
   * @param {number} [opts.smoothing=0] - Lerp smoothing factor (0 = instant, 0.9 = very smooth)
   * @returns {{ destroy: function }}
   */
  function scrub(el, opts) {
    const from = opts.from || {};
    const to = opts.to || {};
    const smoothing = opts.smoothing ?? 0;
    const startConfig = parseEdge(opts.start || 'top bottom');
    const endConfig = parseEdge(opts.end || 'bottom top');

    if (prefersReducedMotion) {
      return { destroy: function () {} };
    }

    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    const props = {};
    for (const key of allKeys) {
      const defVal = (key === 'scale') ? 1 : (key === 'opacity') ? 1 : 0;
      props[key] = { from: from[key] ?? defVal, to: to[key] ?? defVal };
    }

    let currentProgress = 0;
    let targetProgress = 0;
    let ticking = false;
    let destroyed = false;

    function computeProgress() {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Compute start and end scroll positions
      const elTop = rect.top;
      const elBottom = rect.bottom;
      const elHeight = rect.height;

      const startPx = getEdgePx(startConfig, elTop, elBottom, elHeight, vh);
      const endPx = getEdgePx(endConfig, elTop, elBottom, elHeight, vh);

      if (startPx === endPx) return 0;
      return clamp((0 - startPx) / (endPx - startPx), 0, 1);
    }

    function applyProgress(progress) {
      const vals = {};
      for (const key of Object.keys(props)) {
        const p = props[key];
        vals[key] = p.from + (p.to - p.from) * progress;
      }
      applyTransform(el, vals);
    }

    function tick() {
      if (destroyed) return;
      targetProgress = computeProgress();

      if (smoothing > 0) {
        currentProgress += (targetProgress - currentProgress) * (1 - smoothing);
        if (Math.abs(currentProgress - targetProgress) > 0.001) {
          requestAnimationFrame(tick);
        } else {
          currentProgress = targetProgress;
          ticking = false;
        }
      } else {
        currentProgress = targetProgress;
        ticking = false;
      }

      applyProgress(currentProgress);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial calculation
    requestAnimationFrame(tick);

    return {
      destroy: function () {
        destroyed = true;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      },
    };
  }

  /* ============================================================
     SCROLL PROGRESS (e.g., progress bar)
     ============================================================ */

  /**
   * Map page scroll progress to a CSS property.
   * @param {Element} el
   * @param {Object} opts
   * @param {string} [opts.property='scaleX'] - CSS transform to animate
   * @param {number} [opts.from=0]
   * @param {number} [opts.to=1]
   * @param {string} [opts.scope='page'] - 'page' = entire document, 'element' = el's scroll range
   * @returns {{ destroy: function }}
   */
  function progress(el, opts) {
    opts = opts || {};
    const property = opts.property || 'scaleX';
    const from = opts.from ?? 0;
    const to = opts.to ?? 1;
    const scope = opts.scope || 'page';

    if (prefersReducedMotion) {
      return { destroy: function () {} };
    }

    el.style.transformOrigin = 'left center';
    let destroyed = false;

    function onScroll() {
      if (destroyed) return;
      let t;
      if (scope === 'page') {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        t = docHeight > 0 ? scrollTop / docHeight : 0;
      } else {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        t = clamp(1 - rect.top / vh, 0, 1);
      }

      const value = from + (to - from) * t;
      el.style.transform = property + '(' + value + ')';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return {
      destroy: function () {
        destroyed = true;
        window.removeEventListener('scroll', onScroll);
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

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function applyTransform(el, vals) {
    const transforms = [];
    if (vals.x !== undefined || vals.y !== undefined) {
      transforms.push(
        'translate3d(' + (vals.x || 0) + 'px, ' + (vals.y || 0) + 'px, 0)'
      );
    }
    if (vals.rotate !== undefined) transforms.push('rotate(' + vals.rotate + 'deg)');
    if (vals.scale !== undefined) transforms.push('scale(' + vals.scale + ')');
    if (vals.scaleX !== undefined) transforms.push('scaleX(' + vals.scaleX + ')');
    if (vals.scaleY !== undefined) transforms.push('scaleY(' + vals.scaleY + ')');
    if (transforms.length > 0) el.style.transform = transforms.join(' ');
    if (vals.opacity !== undefined) el.style.opacity = String(vals.opacity);
  }

  /**
   * Parse edge string like "top bottom" into { element: 'top', viewport: 'bottom' }
   */
  function parseEdge(str) {
    const parts = str.split(' ');
    return {
      element: parts[0] || 'top',
      viewport: parts[1] || 'bottom',
    };
  }

  function getEdgePx(config, elTop, elBottom, elHeight, vh) {
    let elEdge;
    switch (config.element) {
      case 'top':    elEdge = elTop; break;
      case 'center': elEdge = elTop + elHeight / 2; break;
      case 'bottom': elEdge = elBottom; break;
      default:       elEdge = elTop; break;
    }

    let vpEdge;
    switch (config.viewport) {
      case 'top':    vpEdge = 0; break;
      case 'center': vpEdge = vh / 2; break;
      case 'bottom': vpEdge = vh; break;
      default:       vpEdge = vh; break;
    }

    return elEdge - vpEdge;
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var ScrollAnim = {
    reveal: reveal,
    scrub: scrub,
    progress: progress,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnim;
  } else {
    global.ScrollAnim = ScrollAnim;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
