/**
 * cursor-effects.js — Custom cursor trails, magnetic buttons, spotlight
 *
 * Usage:
 *   <script src="cursor-effects.js"></script>
 *   <script>
 *     // Magnetic button: element pulls toward cursor on hover
 *     CursorFX.magnetic('.btn', { strength: 0.3, radius: 100 });
 *
 *     // Cursor trail: fading dots following the cursor
 *     CursorFX.trail({ color: '#6366f1', size: 8, length: 20 });
 *
 *     // Spotlight: radial light following cursor over an element
 *     CursorFX.spotlight('.hero', { size: 300, opacity: 0.15 });
 *
 *     // Custom cursor: replace default cursor with a styled element
 *     CursorFX.custom({ size: 20, color: '#6366f1', mixBlendMode: 'difference' });
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
     MAGNETIC BUTTON
     Element subtly moves toward the cursor when hovering nearby.
     ============================================================ */

  /**
   * @param {string|Element|NodeList} target
   * @param {Object} [opts]
   * @param {number} [opts.strength=0.3] - How strongly it pulls (0-1)
   * @param {number} [opts.radius=100]   - Detection radius in px
   * @param {number} [opts.smoothing=0.15] - Movement smoothing
   * @returns {{ destroy: function }}
   */
  function magnetic(target, opts) {
    opts = opts || {};
    const strength = opts.strength ?? 0.3;
    const radius = opts.radius ?? 100;
    const smoothing = opts.smoothing ?? 0.15;

    if (prefersReducedMotion) return { destroy: function () {} };

    const elements = resolveElements(target);
    const cleanups = [];

    elements.forEach(function (el) {
      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let rafId = null;
      let isAnimating = false;

      function onMouseMove(e) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          targetX = dx * strength;
          targetY = dy * strength;
        } else {
          targetX = 0;
          targetY = 0;
        }

        if (!isAnimating) {
          isAnimating = true;
          animate();
        }
      }

      function animate() {
        currentX += (targetX - currentX) * smoothing;
        currentY += (targetY - currentY) * smoothing;

        el.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px)';

        if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
          rafId = requestAnimationFrame(animate);
        } else {
          isAnimating = false;
          if (targetX === 0 && targetY === 0) {
            el.style.transform = '';
          }
        }
      }

      function onMouseLeave() {
        targetX = 0;
        targetY = 0;
        if (!isAnimating) {
          isAnimating = true;
          animate();
        }
      }

      document.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(function () {
        document.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transform = '';
      });
    });

    return {
      destroy: function () {
        cleanups.forEach(function (fn) { fn(); });
      },
    };
  }

  /* ============================================================
     CURSOR TRAIL
     Fading dots/circles following the mouse cursor.
     ============================================================ */

  /**
   * @param {Object} [opts]
   * @param {string} [opts.color='#6366f1']
   * @param {number} [opts.size=8]        - Dot size in px
   * @param {number} [opts.length=20]     - Number of trail dots
   * @param {number} [opts.fadeSpeed=0.05] - How fast dots fade (0-1)
   * @returns {{ destroy: function }}
   */
  function trail(opts) {
    opts = opts || {};
    const color = opts.color || '#6366f1';
    const size = opts.size || 8;
    const length = opts.length || 20;
    const fadeSpeed = opts.fadeSpeed || 0.05;

    if (prefersReducedMotion) return { destroy: function () {} };

    const dots = [];
    let destroyed = false;

    // Create dot elements
    for (let i = 0; i < length; i++) {
      const dot = document.createElement('div');
      dot.style.cssText =
        'position:fixed;pointer-events:none;z-index:99999;' +
        'border-radius:50%;' +
        'width:' + size + 'px;height:' + size + 'px;' +
        'background:' + color + ';' +
        'opacity:0;' +
        'transform:translate(-50%,-50%);' +
        'transition:none;';
      document.body.appendChild(dot);
      dots.push({ el: dot, x: 0, y: 0, opacity: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function animate() {
      if (destroyed) return;

      // Shift positions: each dot follows the one ahead of it
      for (let i = dots.length - 1; i > 0; i--) {
        dots[i].x = dots[i - 1].x;
        dots[i].y = dots[i - 1].y;
      }
      dots[0].x = mouseX;
      dots[0].y = mouseY;

      // Update DOM
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const scale = 1 - i / dots.length;
        const opacity = scale * 0.8;
        d.el.style.left = d.x + 'px';
        d.el.style.top = d.y + 'px';
        d.el.style.opacity = String(opacity);
        d.el.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
      }

      requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', onMouseMove);
    animate();

    return {
      destroy: function () {
        destroyed = true;
        document.removeEventListener('mousemove', onMouseMove);
        dots.forEach(function (d) {
          if (d.el.parentNode) d.el.parentNode.removeChild(d.el);
        });
      },
    };
  }

  /* ============================================================
     SPOTLIGHT
     Radial gradient light that follows cursor over an element.
     ============================================================ */

  /**
   * @param {string|Element} target
   * @param {Object} [opts]
   * @param {number} [opts.size=300]     - Spotlight radius in px
   * @param {number} [opts.opacity=0.15] - Light intensity
   * @param {string} [opts.color='rgba(255,255,255,']
   * @returns {{ destroy: function }}
   */
  function spotlight(target, opts) {
    opts = opts || {};
    const size = opts.size || 300;
    const intensity = opts.opacity ?? 0.15;
    const color = opts.color || 'rgba(255,255,255,';

    if (prefersReducedMotion) return { destroy: function () {} };

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { destroy: function () {} };

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:1;' +
      'opacity:0;transition:opacity 300ms ease;';
    el.style.position = el.style.position || 'relative';
    el.appendChild(overlay);

    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      overlay.style.background =
        'radial-gradient(circle ' + size + 'px at ' + x + 'px ' + y + 'px, ' +
        color + intensity + '), transparent)';
      overlay.style.opacity = '1';
    }

    function onMouseLeave() {
      overlay.style.opacity = '0';
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return {
      destroy: function () {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      },
    };
  }

  /* ============================================================
     CUSTOM CURSOR
     Replace default cursor with a styled DOM element.
     ============================================================ */

  /**
   * @param {Object} [opts]
   * @param {number} [opts.size=20]
   * @param {string} [opts.color='#6366f1']
   * @param {string} [opts.mixBlendMode='difference']
   * @param {number} [opts.smoothing=0.15]
   * @returns {{ destroy: function }}
   */
  function custom(opts) {
    opts = opts || {};
    const size = opts.size || 20;
    const color = opts.color || '#6366f1';
    const blend = opts.mixBlendMode || 'difference';
    const smoothing = opts.smoothing ?? 0.15;

    if (prefersReducedMotion) return { destroy: function () {} };

    const cursor = document.createElement('div');
    cursor.style.cssText =
      'position:fixed;pointer-events:none;z-index:999999;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'border-radius:50%;' +
      'background:' + color + ';' +
      'mix-blend-mode:' + blend + ';' +
      'transform:translate(-50%,-50%);' +
      'transition:width 200ms ease, height 200ms ease;';
    document.body.appendChild(cursor);
    document.body.style.cursor = 'none';

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let destroyed = false;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function animate() {
      if (destroyed) return;
      cursorX += (mouseX - cursorX) * smoothing;
      cursorY += (mouseY - cursorY) * smoothing;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animate);
    }

    // Grow on interactive elements
    function onMouseOver(e) {
      if (e.target.matches('a, button, [role="button"], input, textarea, select, [data-cursor-grow]')) {
        cursor.style.width = size * 2 + 'px';
        cursor.style.height = size * 2 + 'px';
        cursor.style.opacity = '0.5';
      }
    }

    function onMouseOut(e) {
      cursor.style.width = size + 'px';
      cursor.style.height = size + 'px';
      cursor.style.opacity = '1';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    animate();

    return {
      destroy: function () {
        destroyed = true;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mouseout', onMouseOut);
        document.body.style.cursor = '';
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
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

  var CursorFX = {
    magnetic: magnetic,
    trail: trail,
    spotlight: spotlight,
    custom: custom,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CursorFX;
  } else {
    global.CursorFX = CursorFX;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
