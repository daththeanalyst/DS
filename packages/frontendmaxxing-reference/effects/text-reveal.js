/**
 * text-reveal.js — Split text and animate character-by-character, word-by-word, or line-by-line
 *
 * Usage:
 *   <script src="text-reveal.js"></script>
 *   <script>
 *     // Character-by-character reveal
 *     TextReveal.split('.headline', {
 *       type: 'char',       // 'char' | 'word' | 'line'
 *       animation: 'fadeUp', // 'fadeUp' | 'fadeIn' | 'scaleIn' | 'rotateIn' | 'slideLeft'
 *       stagger: 30,         // ms between each unit
 *       duration: 500,
 *     });
 *
 *     // Word-by-word
 *     TextReveal.split('.subtitle', { type: 'word', stagger: 80 });
 *
 *     // Typewriter effect
 *     TextReveal.typewriter('.tagline', {
 *       speed: 50,           // ms per character
 *       cursor: true,
 *       cursorChar: '|',
 *     });
 *
 *     // Scramble/decode effect
 *     TextReveal.scramble('.title', {
 *       speed: 30,
 *       iterations: 3,       // scramble passes per character
 *       chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%',
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
     SPLIT & ANIMATE
     ============================================================ */

  /**
   * Split text into units (char/word/line) and stagger-animate them.
   * @param {string|Element} target
   * @param {Object} [opts]
   * @param {string} [opts.type='char']   - 'char' | 'word' | 'line'
   * @param {string} [opts.animation='fadeUp'] - Animation style
   * @param {number} [opts.stagger=30]    - Delay between units (ms)
   * @param {number} [opts.duration=500]  - Duration per unit (ms)
   * @param {string} [opts.easing='cubic-bezier(0.22, 1, 0.36, 1)']
   * @returns {{ revert: function }}
   */
  function split(target, opts) {
    opts = opts || {};
    const type = opts.type || 'char';
    const animation = opts.animation || 'fadeUp';
    const stagger = opts.stagger ?? (type === 'char' ? 30 : type === 'word' ? 80 : 150);
    const duration = opts.duration ?? 500;
    const easing = opts.easing || 'cubic-bezier(0.22, 1, 0.36, 1)';

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { revert: function () {} };

    const originalHTML = el.innerHTML;
    const text = el.textContent || '';

    if (prefersReducedMotion) {
      return { revert: function () { el.innerHTML = originalHTML; } };
    }

    // Split text into units
    let units;
    if (type === 'char') {
      units = text.split('');
    } else if (type === 'word') {
      units = text.split(/(\s+)/); // keep whitespace
    } else {
      // Line splitting: approximate by using the element width
      units = [text]; // fallback to single line
    }

    // Build HTML with spans
    el.innerHTML = '';
    const spans = [];

    units.forEach(function (unit, i) {
      if (unit === ' ' || /^\s+$/.test(unit)) {
        el.appendChild(document.createTextNode(unit));
        return;
      }

      if (type === 'char') {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'pre';
        span.textContent = unit === ' ' ? '\u00A0' : unit;
        el.appendChild(span);
        spans.push(span);
      } else {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.textContent = unit;
        el.appendChild(span);
        spans.push(span);

        // Add space after word
        if (type === 'word') {
          el.appendChild(document.createTextNode(' '));
        }
      }
    });

    // Get animation keyframes
    const keyframes = getAnimationKeyframes(animation);

    // Animate each span
    spans.forEach(function (span, i) {
      span.animate(keyframes, {
        duration: duration,
        delay: i * stagger,
        easing: easing,
        fill: 'both',
      });
    });

    return {
      revert: function () {
        el.innerHTML = originalHTML;
      },
    };
  }

  function getAnimationKeyframes(name) {
    switch (name) {
      case 'fadeUp':
        return [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ];
      case 'fadeIn':
        return [
          { opacity: 0 },
          { opacity: 1 },
        ];
      case 'scaleIn':
        return [
          { opacity: 0, transform: 'scale(0.5)' },
          { opacity: 1, transform: 'scale(1)' },
        ];
      case 'rotateIn':
        return [
          { opacity: 0, transform: 'rotateX(90deg)' },
          { opacity: 1, transform: 'rotateX(0deg)' },
        ];
      case 'slideLeft':
        return [
          { opacity: 0, transform: 'translateX(30px)' },
          { opacity: 1, transform: 'translateX(0)' },
        ];
      case 'slideRight':
        return [
          { opacity: 0, transform: 'translateX(-30px)' },
          { opacity: 1, transform: 'translateX(0)' },
        ];
      case 'blurIn':
        return [
          { opacity: 0, filter: 'blur(10px)' },
          { opacity: 1, filter: 'blur(0)' },
        ];
      default:
        return [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ];
    }
  }

  /* ============================================================
     TYPEWRITER
     ============================================================ */

  /**
   * @param {string|Element} target
   * @param {Object} [opts]
   * @param {number} [opts.speed=50]         - ms per character
   * @param {boolean} [opts.cursor=true]     - Show blinking cursor
   * @param {string} [opts.cursorChar='|']
   * @param {number} [opts.startDelay=0]
   * @param {function} [opts.onComplete]
   * @returns {{ cancel: function }}
   */
  function typewriter(target, opts) {
    opts = opts || {};
    const speed = opts.speed ?? 50;
    const showCursor = opts.cursor !== false;
    const cursorChar = opts.cursorChar || '|';
    const startDelay = opts.startDelay ?? 0;

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { cancel: function () {} };

    const text = el.textContent || '';
    let index = 0;
    let cancelled = false;
    let timeoutId;

    if (prefersReducedMotion) {
      return { cancel: function () {} };
    }

    el.textContent = '';

    // Add cursor element
    let cursorEl;
    if (showCursor) {
      cursorEl = document.createElement('span');
      cursorEl.textContent = cursorChar;
      cursorEl.style.animation = 'textreveal-blink 1s step-end infinite';
      el.appendChild(cursorEl);

      // Inject blink keyframes if not already present
      if (!document.getElementById('textreveal-styles')) {
        const style = document.createElement('style');
        style.id = 'textreveal-styles';
        style.textContent = '@keyframes textreveal-blink { 0%,100%{opacity:1} 50%{opacity:0} }';
        document.head.appendChild(style);
      }
    }

    function type() {
      if (cancelled || index >= text.length) {
        if (opts.onComplete) opts.onComplete();
        return;
      }

      // Insert character before cursor
      const textNode = document.createTextNode(text[index]);
      if (cursorEl) {
        el.insertBefore(textNode, cursorEl);
      } else {
        el.appendChild(textNode);
      }

      index++;
      timeoutId = setTimeout(type, speed);
    }

    timeoutId = setTimeout(type, startDelay);

    return {
      cancel: function () {
        cancelled = true;
        clearTimeout(timeoutId);
        el.textContent = text;
      },
    };
  }

  /* ============================================================
     SCRAMBLE / DECODE
     ============================================================ */

  /**
   * @param {string|Element} target
   * @param {Object} [opts]
   * @param {number} [opts.speed=30]       - ms per step
   * @param {number} [opts.iterations=3]   - Scramble passes before revealing
   * @param {string} [opts.chars]          - Character set for scrambling
   * @param {function} [opts.onComplete]
   * @returns {{ cancel: function }}
   */
  function scramble(target, opts) {
    opts = opts || {};
    const speed = opts.speed ?? 30;
    const iterations = opts.iterations ?? 3;
    const chars = opts.chars || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { cancel: function () {} };

    const finalText = el.textContent || '';
    let cancelled = false;
    let intervalId;

    if (prefersReducedMotion) {
      return { cancel: function () {} };
    }

    let revealIndex = 0;
    let tick = 0;

    intervalId = setInterval(function () {
      if (cancelled) return;

      let output = '';
      for (let i = 0; i < finalText.length; i++) {
        if (i < revealIndex) {
          output += finalText[i];
        } else if (finalText[i] === ' ') {
          output += ' ';
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      el.textContent = output;
      tick++;

      if (tick % iterations === 0) {
        revealIndex++;
      }

      if (revealIndex >= finalText.length) {
        clearInterval(intervalId);
        el.textContent = finalText;
        if (opts.onComplete) opts.onComplete();
      }
    }, speed);

    return {
      cancel: function () {
        cancelled = true;
        clearInterval(intervalId);
        el.textContent = finalText;
      },
    };
  }

  /* ============================================================
     EXPORTS
     ============================================================ */

  var TextReveal = {
    split: split,
    typewriter: typewriter,
    scramble: scramble,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextReveal;
  } else {
    global.TextReveal = TextReveal;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
