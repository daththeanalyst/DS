/**
 * parallax.js — Multi-layer parallax with depth control
 *
 * Usage:
 *   <script src="parallax.js"></script>
 *   <script>
 *     // Simple parallax: elements move at different rates on scroll
 *     Parallax.scroll('.parallax-layer', {
 *       speed: 0.3,          // 0 = fixed, 1 = normal scroll, <1 = slower, >1 = faster
 *       direction: 'vertical', // 'vertical' | 'horizontal' | 'both'
 *     });
 *
 *     // Multi-layer: pass different speeds per data attribute
 *     // <div class="layer" data-parallax-speed="0.2">Background</div>
 *     // <div class="layer" data-parallax-speed="0.5">Midground</div>
 *     // <div class="layer" data-parallax-speed="0.8">Foreground</div>
 *     Parallax.layers('.layer');
 *
 *     // Mouse parallax: elements shift based on mouse position
 *     Parallax.mouse('.scene', {
 *       intensity: 20,       // max px shift
 *       smoothing: 0.1,
 *     });
 *
 *     // Tilt card: 3D perspective tilt on hover
 *     Parallax.tilt('.card', {
 *       maxTilt: 15,         // degrees
 *       glare: true,         // add glare overlay
 *       scale: 1.05,         // scale on hover
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
     SCROLL PARALLAX
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.speed=0.3]   - Parallax speed multiplier
   * @param {string} [opts.direction='vertical'] - 'vertical' | 'horizontal' | 'both'
   * @returns {{ destroy: function }}
   */
  function scroll(target, opts) {
    opts = opts || {};
    const speed = opts.speed ?? 0.3;
    const direction = opts.direction || 'vertical';

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    let ticking = false;
    let destroyed = false;

    function update() {
      if (destroyed) return;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      elements.forEach(function (el) {
        const elSpeed = parseFloat(el.dataset.parallaxSpeed) || speed;
        const offset = scrollY * elSpeed;
        const offsetX = scrollX * elSpeed;

        let transform;
        if (direction === 'horizontal') {
          transform = 'translate3d(' + offsetX + 'px, 0, 0)';
        } else if (direction === 'both') {
          transform = 'translate3d(' + offsetX + 'px, ' + offset + 'px, 0)';
        } else {
          transform = 'translate3d(0, ' + offset + 'px, 0)';
        }
        el.style.transform = transform;
        el.style.willChange = 'transform';
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial

    return {
      destroy: function () {
        destroyed = true;
        window.removeEventListener('scroll', onScroll);
        elements.forEach(function (el) {
          el.style.transform = '';
          el.style.willChange = '';
        });
      },
    };
  }

  /* ============================================================
     MULTI-LAYER (data attribute driven)
     ============================================================ */

  /**
   * Each element should have data-parallax-speed="0.2" etc.
   * @param {string|NodeList} target
   * @returns {{ destroy: function }}
   */
  function layers(target) {
    return scroll(target, { speed: 0.3 }); // speed is overridden per-element via data attribute
  }

  /* ============================================================
     MOUSE PARALLAX
     ============================================================ */

  /**
   * Elements shift based on mouse position relative to a container.
   * @param {string|Element} container
   * @param {Object} [opts]
   * @param {number} [opts.intensity=20]   - Max px shift
   * @param {number} [opts.smoothing=0.1]  - Movement smoothing (0-1)
   * @returns {{ destroy: function }}
   */
  function mouse(container, opts) {
    opts = opts || {};
    const intensity = opts.intensity ?? 20;
    const smoothing = opts.smoothing ?? 0.1;

    if (prefersReducedMotion) return { destroy: function () {} };

    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return { destroy: function () {} };

    const children = Array.from(el.children);
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let destroyed = false;
    let rafId;

    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      // Normalize to -1...1
      targetX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      targetY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    }

    function onMouseLeave() {
      targetX = 0;
      targetY = 0;
    }

    function animate() {
      if (destroyed) return;
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;

      children.forEach(function (child, i) {
        const depth = parseFloat(child.dataset.parallaxDepth) || (i + 1) / children.length;
        const moveX = currentX * intensity * depth;
        const moveY = currentY * intensity * depth;
        child.style.transform = 'translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
      });

      rafId = requestAnimationFrame(animate);
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    animate();

    return {
      destroy: function () {
        destroyed = true;
        if (rafId) cancelAnimationFrame(rafId);
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
        children.forEach(function (child) {
          child.style.transform = '';
        });
      },
    };
  }

  /* ============================================================
     TILT CARD (3D perspective)
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.maxTilt=15]     - Max tilt in degrees
   * @param {boolean} [opts.glare=false]   - Add glare overlay
   * @param {number} [opts.scale=1]        - Scale on hover
   * @param {number} [opts.smoothing=0.1]
   * @param {boolean} [opts.perspective=800]
   * @returns {{ destroy: function }}
   */
  function tilt(target, opts) {
    opts = opts || {};
    const maxTilt = opts.maxTilt ?? 15;
    const showGlare = opts.glare || false;
    const hoverScale = opts.scale ?? 1;
    const smoothing = opts.smoothing ?? 0.1;
    const perspective = opts.perspective ?? 800;

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    const cleanups = [];

    elements.forEach(function (el) {
      el.style.transformStyle = 'preserve-3d';
      el.style.transition = 'transform 300ms ease';

      let glareEl;
      if (showGlare) {
        glareEl = document.createElement('div');
        glareEl.style.cssText =
          'position:absolute;inset:0;pointer-events:none;' +
          'background:linear-gradient(135deg,rgba(255,255,255,0.25),transparent);' +
          'opacity:0;transition:opacity 300ms ease;border-radius:inherit;';
        el.style.position = el.style.position || 'relative';
        el.style.overflow = 'hidden';
        el.appendChild(glareEl);
      }

      let targetTiltX = 0, targetTiltY = 0;
      let currentTiltX = 0, currentTiltY = 0;
      let isHovering = false;
      let rafId;

      function onMouseMove(e) {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        targetTiltX = (y - 0.5) * maxTilt * -2;
        targetTiltY = (x - 0.5) * maxTilt * 2;

        if (glareEl) {
          const angle = Math.atan2(e.clientY - rect.top - rect.height / 2,
                                    e.clientX - rect.left - rect.width / 2) * 180 / Math.PI;
          glareEl.style.background =
            'linear-gradient(' + (angle + 135) + 'deg, rgba(255,255,255,0.3), transparent)';
          glareEl.style.opacity = '1';
        }
      }

      function onMouseEnter() {
        isHovering = true;
        el.style.transition = 'none';
        animate();
      }

      function onMouseLeave() {
        isHovering = false;
        targetTiltX = 0;
        targetTiltY = 0;
        el.style.transition = 'transform 500ms ease';
        el.style.transform = 'perspective(' + perspective + 'px) rotateX(0) rotateY(0) scale(1)';
        if (glareEl) glareEl.style.opacity = '0';
      }

      function animate() {
        if (!isHovering) return;
        currentTiltX += (targetTiltX - currentTiltX) * smoothing;
        currentTiltY += (targetTiltY - currentTiltY) * smoothing;
        el.style.transform =
          'perspective(' + perspective + 'px) ' +
          'rotateX(' + currentTiltX + 'deg) ' +
          'rotateY(' + currentTiltY + 'deg) ' +
          'scale(' + hoverScale + ')';
        rafId = requestAnimationFrame(animate);
      }

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(function () {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transform = '';
        el.style.transformStyle = '';
        if (glareEl && glareEl.parentNode) glareEl.parentNode.removeChild(glareEl);
      });
    });

    return {
      destroy: function () {
        cleanups.forEach(function (fn) { fn(); });
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

  /* ============================================================
     EXPORTS
     ============================================================ */

  var Parallax = {
    scroll: scroll,
    layers: layers,
    mouse: mouse,
    tilt: tilt,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Parallax;
  } else {
    global.Parallax = Parallax;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
