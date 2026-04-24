/* ============================================
   SMOOTH SCROLL — Lenis-like smooth scrolling
   Inspired by shader.se + trucknroll.com
   ============================================
   Usage:
     const scroller = SmoothScroll.init();

     // With options:
     SmoothScroll.init({
       lerp: 0.1,
       wheelMultiplier: 1,
       touchMultiplier: 2,
       snap: true,
       snapTargets: '.section'
     });

     // API:
     scroller.scrollTo('#section-2');
     scroller.scrollTo(500);
     scroller.stop();
     scroller.start();
     scroller.destroy();

     // Snap points:
     scroller.addSnap(500);
     scroller.addSnap('#my-section');
   ============================================ */
(function (root) {
  'use strict';

  var defaults = {
    lerp: 0.1,              // smoothing factor (0-1)
    wheelMultiplier: 1,      // scroll speed multiplier
    touchMultiplier: 2,      // touch scroll speed
    orientation: 'vertical', // 'vertical' or 'horizontal'
    smooth: true,            // enable smooth scrolling
    snap: false,             // enable snap points
    snapTargets: null,       // selector for auto-snap elements
    snapThreshold: 100,      // snap activation distance in px
    keyboard: true,          // keyboard navigation for snaps
    wrapper: null,           // scroll wrapper (null = document)
    content: null            // scroll content (null = document.body)
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function init(opts) {
    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    if (opts) for (var k2 in opts) o[k2] = opts[k2];

    var isVertical = o.orientation === 'vertical';
    var targetScroll = isVertical ? window.scrollY : window.scrollX;
    var currentScroll = targetScroll;
    var velocity = 0;
    var direction = 0;
    var running = true;
    var raf = null;
    var snapPoints = [];
    var isSnapping = false;
    var listeners = [];

    // Apply smooth scroll styling
    if (o.smooth) {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // ── Snap points ──
    function addSnap(target) {
      if (typeof target === 'string') {
        var el = document.querySelector(target);
        if (el) snapPoints.push({ el: el, offset: 0 });
      } else if (typeof target === 'number') {
        snapPoints.push({ position: target, offset: 0 });
      }
    }

    // Auto-add snap targets
    if (o.snapTargets) {
      document.querySelectorAll(o.snapTargets).forEach(function (el) {
        snapPoints.push({ el: el, offset: 0 });
      });
    }

    function getSnapPosition(snap) {
      if (snap.el) {
        var rect = snap.el.getBoundingClientRect();
        return (isVertical ? rect.top : rect.left) + currentScroll + (snap.offset || 0);
      }
      return snap.position + (snap.offset || 0);
    }

    function findNearestSnap(scrollPos, dir) {
      if (snapPoints.length === 0) return null;
      var nearest = null;
      var nearestDist = Infinity;

      snapPoints.forEach(function (snap) {
        var pos = getSnapPosition(snap);
        var dist = pos - scrollPos;

        // Filter by direction
        if (dir > 0 && dist < o.snapThreshold) return;
        if (dir < 0 && dist > -o.snapThreshold) return;

        var absDist = Math.abs(dist);
        if (absDist < nearestDist) {
          nearestDist = absDist;
          nearest = pos;
        }
      });

      return nearest;
    }

    // ── Wheel handler ──
    function onWheel(e) {
      if (!o.smooth) return;
      e.preventDefault();

      var delta = isVertical ? e.deltaY : e.deltaX;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && isVertical) {
        delta = e.deltaX; // handle horizontal trackpad gestures
      }

      targetScroll += delta * o.wheelMultiplier;
      targetScroll = clamp(targetScroll, 0, getMaxScroll());
      direction = delta > 0 ? 1 : -1;
    }

    // ── Touch handler ──
    var touchStart = 0;
    var touchStartScroll = 0;

    function onTouchStart(e) {
      if (!o.smooth) return;
      touchStart = isVertical ? e.touches[0].clientY : e.touches[0].clientX;
      touchStartScroll = targetScroll;
    }

    function onTouchMove(e) {
      if (!o.smooth) return;
      var touchPos = isVertical ? e.touches[0].clientY : e.touches[0].clientX;
      var delta = (touchStart - touchPos) * o.touchMultiplier;
      targetScroll = clamp(touchStartScroll + delta, 0, getMaxScroll());
      direction = delta > 0 ? 1 : -1;
    }

    function onTouchEnd() {
      if (o.snap && !isSnapping) {
        var nearest = findNearestSnap(targetScroll, direction);
        if (nearest !== null) {
          isSnapping = true;
          targetScroll = nearest;
          setTimeout(function () { isSnapping = false; }, 500);
        }
      }
    }

    // ── Keyboard ──
    function onKeyDown(e) {
      if (!o.keyboard || !o.snap) return;
      if (e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault();
        var next = findNearestSnap(currentScroll + 10, 1);
        if (next !== null) targetScroll = next;
      } else if (e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault();
        var prev = findNearestSnap(currentScroll - 10, -1);
        if (prev !== null) targetScroll = prev;
      }
    }

    function getMaxScroll() {
      if (isVertical) {
        return document.documentElement.scrollHeight - window.innerHeight;
      }
      return document.documentElement.scrollWidth - window.innerWidth;
    }

    // ── RAF loop ──
    function tick() {
      if (!running) return;

      var prev = currentScroll;
      currentScroll = lerp(currentScroll, targetScroll, o.lerp);

      // Snap to target when close enough
      if (Math.abs(currentScroll - targetScroll) < 0.5) {
        currentScroll = targetScroll;
      }

      velocity = currentScroll - prev;
      direction = velocity > 0 ? 1 : velocity < 0 ? -1 : direction;

      if (o.smooth) {
        window.scrollTo({
          top: isVertical ? currentScroll : undefined,
          left: isVertical ? undefined : currentScroll,
          behavior: 'instant'
        });
      }

      // Notify listeners
      listeners.forEach(function (fn) {
        fn({
          scroll: currentScroll,
          velocity: velocity,
          direction: direction,
          progress: currentScroll / (getMaxScroll() || 1)
        });
      });

      raf = requestAnimationFrame(tick);
    }

    // ── Bind events ──
    if (o.smooth) {
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }
    if (o.keyboard) {
      window.addEventListener('keydown', onKeyDown);
    }

    raf = requestAnimationFrame(tick);

    // ── Public API ──
    function scrollTo(target, options) {
      var pos = 0;
      if (typeof target === 'number') {
        pos = target;
      } else if (typeof target === 'string') {
        var el = document.querySelector(target);
        if (el) {
          var rect = el.getBoundingClientRect();
          pos = (isVertical ? rect.top : rect.left) + currentScroll;
        }
      } else if (target && target.getBoundingClientRect) {
        var r = target.getBoundingClientRect();
        pos = (isVertical ? r.top : r.left) + currentScroll;
      }
      targetScroll = clamp(pos, 0, getMaxScroll());

      // If not smooth, jump immediately
      if (options && options.immediate) {
        currentScroll = targetScroll;
      }
    }

    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
    function start() { if (!running) { running = true; tick(); } }
    function onScroll(fn) { listeners.push(fn); }

    function destroy() {
      stop();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.scrollBehavior = '';
    }

    return {
      scrollTo: scrollTo,
      stop: stop,
      start: start,
      destroy: destroy,
      onScroll: onScroll,
      addSnap: addSnap,
      get scroll() { return currentScroll; },
      get velocity() { return velocity; },
      get direction() { return direction; }
    };
  }

  var SmoothScroll = { init: init };

  if (typeof module !== 'undefined' && module.exports) module.exports = SmoothScroll;
  else root.SmoothScroll = SmoothScroll;
})(typeof window !== 'undefined' ? window : this);
