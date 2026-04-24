/* ============================================
   MARQUEE — Infinite scroll with velocity
   Inspired by trucknroll.com
   ============================================
   Usage:
     Marquee.init('.marquee');
     Marquee.init('.marquee', {
       speed: 1,
       scrollInfluence: 0.5,
       direction: 1,    // 1 = left, -1 = right
       pauseOnHover: true
     });
   ============================================ */
(function (root) {
  'use strict';

  var defaults = {
    speed: 1,            // base pixels per frame
    scrollInfluence: 0.5, // how much scroll velocity affects speed
    direction: 1,         // 1 = left, -1 = right
    pauseOnHover: false,
    clone: true           // auto-clone content for seamless loop
  };

  // Shared scroll velocity tracker
  var scrollState = {
    velocity: 0,
    direction: 1,
    lastScroll: 0,
    tracking: false
  };

  function trackScroll() {
    if (scrollState.tracking) return;
    scrollState.tracking = true;
    var lastY = window.scrollY;
    var lastT = performance.now();

    function update() {
      var now = performance.now();
      var dt = now - lastT;
      if (dt > 0) {
        var dy = window.scrollY - lastY;
        scrollState.velocity = dy / dt * 16; // normalize to ~60fps
        scrollState.direction = dy >= 0 ? 1 : -1;
        lastY = window.scrollY;
        lastT = now;
      }
      // Decay velocity
      scrollState.velocity *= 0.95;
      requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function init(target, opts) {
    trackScroll();

    var els = typeof target === 'string'
      ? document.querySelectorAll(target)
      : [target];
    var instances = [];
    els.forEach(function (el) { instances.push(createInstance(el, opts)); });
    return instances.length === 1 ? instances[0] : instances;
  }

  function createInstance(el, opts) {
    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    if (opts) for (var k2 in opts) o[k2] = opts[k2];

    var track = el.querySelector('.marquee-track');
    if (!track) return null;

    // Clone content for seamless loop
    if (o.clone) {
      var items = track.innerHTML;
      var containerW = el.offsetWidth;
      var trackW = track.scrollWidth;
      // Need enough clones to fill at least 2x viewport
      var clones = Math.ceil((containerW * 2) / trackW) + 1;
      for (var i = 0; i < clones; i++) {
        track.insertAdjacentHTML('beforeend', items);
      }
    }

    var paused = false;
    var translate = 0;
    var patternWidth = track.scrollWidth / (o.clone ? Math.ceil(el.offsetWidth * 2 / track.children[0].offsetWidth) + 2 : 1);
    var raf = null;

    // Recalculate pattern width after cloning
    var firstHalfWidth = 0;
    var originalCount = track.children.length / (o.clone ? Math.ceil(el.offsetWidth * 2 / track.children[0]?.offsetWidth || 1) + 2 : 1);
    // Simpler: use half of total track width since we doubled+ content
    patternWidth = track.scrollWidth / 2;

    // Kill CSS animation since we're using JS
    track.style.animation = 'none';

    function tick() {
      if (!paused) {
        var scrollVel = Math.abs(scrollState.velocity) * o.scrollInfluence;
        var scrollDir = scrollState.direction === 0 ? 1 : scrollState.direction;
        var frameSpeed = o.speed + scrollVel;

        translate -= frameSpeed * o.direction * scrollDir;

        // Seamless loop
        if (translate <= -patternWidth) {
          translate += patternWidth;
        } else if (translate >= 0) {
          translate -= patternWidth;
        }

        track.style.transform = 'translate3d(' + translate.toFixed(2) + 'px, 0, 0)';
      }
      raf = requestAnimationFrame(tick);
    }

    if (o.pauseOnHover) {
      el.addEventListener('mouseenter', function () { paused = true; });
      el.addEventListener('mouseleave', function () { paused = false; });
    }

    // Start
    raf = requestAnimationFrame(tick);

    function destroy() {
      if (raf) cancelAnimationFrame(raf);
    }

    return { el: el, destroy: destroy };
  }

  var Marquee = { init: init };

  if (typeof module !== 'undefined' && module.exports) module.exports = Marquee;
  else root.Marquee = Marquee;
})(typeof window !== 'undefined' ? window : this);
