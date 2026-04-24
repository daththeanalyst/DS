/* ============================================
   SPOTLIGHT REVEAL — Mouse-tracking spotlight
   Inspired by trucknroll.com
   ============================================
   Usage:
     SpotlightReveal.init('.spotlight-reveal');
     SpotlightReveal.init('.spotlight-reveal', { radius: 500, lerp: 0.1 });
   ============================================ */
(function (root) {
  'use strict';

  var defaults = {
    radius: 400,
    core: 10,
    lerp: 0.08,
    color: null,    // override text color inside spotlight
    textSelector: '.spotlight-reveal-text'
  };

  function init(target, opts) {
    var els = typeof target === 'string'
      ? document.querySelectorAll(target)
      : [target];

    var instances = [];
    els.forEach(function (el) {
      instances.push(createInstance(el, opts));
    });
    return instances.length === 1 ? instances[0] : instances;
  }

  function createInstance(el, opts) {
    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    if (opts) for (var k2 in opts) o[k2] = opts[k2];

    var mouseX = 0.5, mouseY = 0.5;
    var smoothX = 0.5, smoothY = 0.5;
    var raf = null;
    var active = false;
    var rect = null;
    var textEls = el.querySelectorAll(o.textSelector);

    el.style.setProperty('--spotlight-radius', o.radius + 'px');
    el.style.setProperty('--spotlight-core', o.core + 'px');
    el.setAttribute('data-spotlight-active', '');
    textEls.forEach(function (t) { t.setAttribute('data-spotlight-active', ''); });

    function onMouseMove(e) {
      if (!rect) rect = el.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
      if (!active) {
        active = true;
        tick();
      }
    }

    function onMouseLeave() {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    }

    function onResize() { rect = null; }

    function tick() {
      if (!active) return;
      smoothX += (mouseX - smoothX) * o.lerp;
      smoothY += (mouseY - smoothY) * o.lerp;

      var px = (smoothX * 100).toFixed(2) + '%';
      var py = (smoothY * 100).toFixed(2) + '%';

      el.style.setProperty('--mouse-x', px);
      el.style.setProperty('--mouse-y', py);

      // Update text elements with radial gradient
      textEls.forEach(function (t) {
        var tRect = t.getBoundingClientRect();
        var elRect = el.getBoundingClientRect();
        var relX = (smoothX * elRect.width + elRect.left - tRect.left);
        var relY = (smoothY * elRect.height + elRect.top - tRect.top);

        var color = o.color || 'var(--text, #fefefe)';
        t.style.background = 'radial-gradient(circle ' + o.radius + 'px at ' +
          relX + 'px ' + relY + 'px, ' + color + ' ' + o.core + 'px, transparent 100%)';
        t.style.webkitBackgroundClip = 'text';
        t.style.backgroundClip = 'text';
        t.style.color = 'transparent';
      });

      raf = requestAnimationFrame(tick);
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onResize);

    function destroy() {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      el.removeAttribute('data-spotlight-active');
      textEls.forEach(function (t) {
        t.removeAttribute('data-spotlight-active');
        t.style.background = '';
        t.style.color = '';
      });
    }

    return { el: el, destroy: destroy };
  }

  var SpotlightReveal = { init: init };

  if (typeof module !== 'undefined' && module.exports) module.exports = SpotlightReveal;
  else root.SpotlightReveal = SpotlightReveal;
})(typeof window !== 'undefined' ? window : this);
