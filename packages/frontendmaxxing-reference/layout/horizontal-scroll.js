/* ============================================
   HORIZONTAL SCROLL — Vertical→Horizontal
   Inspired by ssscript.app
   ============================================
   Usage:
     <div class="hz-scroll" data-hz-scroll>
       <div class="hz-scroll-sticky">
         <div class="hz-scroll-track">
           <div class="hz-scroll-item">Slide 1</div>
           <div class="hz-scroll-item">Slide 2</div>
           <div class="hz-scroll-item">Slide 3</div>
         </div>
       </div>
     </div>

     HorizontalScroll.init('[data-hz-scroll]');
   ============================================ */
(function (root) {
  'use strict';

  var defaults = {
    stickyTop: '0px',      // top offset for sticky container
    stickyHeight: '100vh', // height of visible viewport
    ease: 0.1,             // lerp smoothing (0-1, lower = smoother)
    itemSelector: '.hz-scroll-item',
    trackSelector: '.hz-scroll-track',
    stickySelector: '.hz-scroll-sticky'
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function init(target, opts) {
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

    var sticky = el.querySelector(o.stickySelector);
    var track = el.querySelector(o.trackSelector);
    if (!sticky || !track) return null;

    var scrollWidth = 0;
    var sectionTop = 0;
    var sectionHeight = 0;
    var currentX = 0;
    var targetX = 0;
    var raf = null;

    // Style the sticky container
    sticky.style.position = 'sticky';
    sticky.style.top = o.stickyTop;
    sticky.style.height = o.stickyHeight;
    sticky.style.overflow = 'hidden';

    // Style the track
    track.style.display = 'flex';
    track.style.height = '100%';
    track.style.willChange = 'transform';

    function measure() {
      scrollWidth = track.scrollWidth - window.innerWidth;
      if (scrollWidth < 0) scrollWidth = 0;

      // Set parent height to create enough scroll distance
      var stickyH = sticky.offsetHeight;
      el.style.height = (stickyH + scrollWidth) + 'px';

      var rect = el.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = el.offsetHeight - stickyH;
    }

    function tick() {
      var scrollY = window.scrollY;
      var rawProgress = (scrollY - sectionTop) / (sectionHeight || 1);
      var progress = clamp(rawProgress, 0, 1);

      targetX = -progress * scrollWidth;

      // Lerp for smoothness
      currentX += (targetX - currentX) * o.ease;

      track.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, 0, 0)';

      raf = requestAnimationFrame(tick);
    }

    // Items get opacity based on visibility
    var items = track.querySelectorAll(o.itemSelector);
    if (items.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
          } else {
            entry.target.style.opacity = '0.3';
            entry.target.style.transform = 'scale(0.95)';
          }
        });
      }, { root: sticky, threshold: 0.5 });

      items.forEach(function (item) {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.flexShrink = '0';
        observer.observe(item);
      });
    }

    measure();
    window.addEventListener('resize', measure);
    raf = requestAnimationFrame(tick);

    function destroy() {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      el.style.height = '';
      track.style.transform = '';
    }

    return { el: el, destroy: destroy, measure: measure };
  }

  var HorizontalScroll = { init: init };

  if (typeof module !== 'undefined' && module.exports) module.exports = HorizontalScroll;
  else root.HorizontalScroll = HorizontalScroll;
})(typeof window !== 'undefined' ? window : this);
