/* ============================================
   TEXT WAVE — Character-by-character shimmer
   Inspired by ssscript.app
   ============================================
   Usage:
     TextWave.init('.my-heading');
     TextWave.init('.my-heading', { speed: 'slow', blur: 2, dimTo: 0.5 });
     const wave = TextWave.create(el, opts);
     wave.start(); wave.stop(); wave.destroy();
   ============================================ */
(function (root) {
  'use strict';

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function interpolate(index, total, fast, slow) {
    var t = total <= 1 ? 0 : index / (total - 1);
    return fast + (slow - fast) * t * t; // ease-out timing
  }

  function calcTiming(charCount, speedPreset) {
    var scale = Math.max(1, charCount);
    var speedMul = speedPreset === 'fast' ? 0.6 : speedPreset === 'slow' ? 1.6 : 1;
    var J = clamp(10 / scale, 0.75, 1.8) * speedMul;
    return {
      fastStep: 18 * J,
      slowStep: 56 * J,
      returnMs: clamp(420 * J, 200, 800),
      loopGap: clamp(1400 + (18 * J + 56 * J) / 2 * scale * 1.2, 1200, 5000)
    };
  }

  function splitChars(el) {
    var text = el.textContent;
    var chars = [];
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.textContent = text[i];
      span.style.display = 'inline-block';
      if (text[i] === ' ') span.style.width = '0.25em';
      el.appendChild(span);
      chars.push(span);
    }
    return chars;
  }

  var defaults = {
    speed: 'normal',  // 'fast', 'normal', 'slow'
    blur: 1.3,        // max blur in px
    dimTo: 0.62,      // opacity when dimmed
    scaleDown: 0.985, // scale when dimmed
    autoStart: true,
    selector: null     // optional: target child elements instead of splitting el
  };

  function create(el, opts) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return null;

    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    if (opts) for (var k2 in opts) o[k2] = opts[k2];

    var chars = o.selector ? Array.from(el.querySelectorAll(o.selector)) : splitChars(el);
    var timing = calcTiming(chars.length, o.speed);
    var running = false;
    var timeouts = [];

    // Set transition on each character
    chars.forEach(function (ch) {
      ch.style.transition = 'opacity ' + timing.returnMs + 'ms ease-in-out, ' +
        'filter ' + timing.returnMs + 'ms ease-in-out, ' +
        'transform ' + timing.returnMs + 'ms ease-in-out';
      ch.style.willChange = 'opacity, filter, transform';
    });

    function dimChar(ch) {
      ch.style.opacity = String(o.dimTo);
      ch.style.filter = 'blur(' + o.blur + 'px)';
      ch.style.transform = 'scale(' + o.scaleDown + ')';
    }

    function restoreChar(ch) {
      ch.style.opacity = '1';
      ch.style.filter = 'blur(0px)';
      ch.style.transform = 'scale(1)';
    }

    function wave() {
      if (!running) return;
      var elapsed = 0;

      chars.forEach(function (ch, i) {
        var delay = interpolate(i, chars.length, timing.fastStep, timing.slowStep);
        var t1 = setTimeout(function () {
          dimChar(ch);
          var t2 = setTimeout(function () { restoreChar(ch); }, timing.returnMs);
          timeouts.push(t2);
        }, elapsed);
        timeouts.push(t1);
        elapsed += delay;
      });

      var t3 = setTimeout(wave, elapsed + timing.loopGap);
      timeouts.push(t3);
    }

    function start() {
      if (running) return;
      running = true;
      wave();
    }

    function stop() {
      running = false;
      timeouts.forEach(clearTimeout);
      timeouts = [];
      chars.forEach(restoreChar);
    }

    function destroy() {
      stop();
      // Restore original text
      var text = '';
      chars.forEach(function (ch) { text += ch.textContent; });
      el.textContent = text;
    }

    if (o.autoStart) start();

    return { start: start, stop: stop, destroy: destroy, el: el };
  }

  function init(target, opts) {
    var els = typeof target === 'string'
      ? document.querySelectorAll(target)
      : [target];
    var instances = [];
    els.forEach(function (el) {
      instances.push(create(el, opts));
    });
    return instances.length === 1 ? instances[0] : instances;
  }

  var TextWave = { init: init, create: create };

  if (typeof module !== 'undefined' && module.exports) module.exports = TextWave;
  else root.TextWave = TextWave;
})(typeof window !== 'undefined' ? window : this);
