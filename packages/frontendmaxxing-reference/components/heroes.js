/**
 * heroes.js — Video background, Ken Burns slideshow, parallax layers, text reveal
 *
 * Usage:
 *   <script src="heroes.js"></script>
 *   <script>
 *     // Video background
 *     Heroes.video('#my-hero', { src: 'bg.mp4', overlay: 0.4 });
 *
 *     // Ken Burns slideshow
 *     Heroes.kenBurns('#hero', ['img1.jpg', 'img2.jpg', 'img3.jpg'], { duration: 6000 });
 *
 *     // Parallax layers
 *     Heroes.parallaxLayers('#hero-parallax');
 *
 *     // Staggered text entrance
 *     Heroes.textReveal('#hero .hero-content');
 *   </script>
 */

(function (global) {
  'use strict';

  var Heroes = {
    /**
     * Set up video background for a hero section.
     * @param {string|Element} target
     * @param {object} opts
     * @param {string} opts.src — video URL
     * @param {number} [opts.overlay=0.4] — overlay opacity (0-1)
     * @param {boolean} [opts.muted=true]
     * @param {boolean} [opts.loop=true]
     */
    video: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      // Create video container
      var container = document.createElement('div');
      container.className = 'hero-video-bg';

      var video = document.createElement('video');
      video.src = opts.src;
      video.muted = opts.muted !== false;
      video.loop = opts.loop !== false;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;';

      container.appendChild(video);
      el.insertBefore(container, el.firstChild);

      // Overlay
      var overlay = el.querySelector('.hero-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        overlay.style.background = 'rgba(0,0,0,' + (opts.overlay || 0.4) + ')';
        el.insertBefore(overlay, container.nextSibling);
      }

      // Try to play (may fail on some mobile browsers)
      video.play().catch(function () {});

      return {
        video: video,
        play: function () { video.play(); },
        pause: function () { video.pause(); },
      };
    },

    /**
     * Ken Burns slideshow with zoom/pan transitions.
     * @param {string|Element} target — hero element
     * @param {string[]} images — array of image URLs
     * @param {object} [opts]
     * @param {number} [opts.duration=6000] — per-image duration in ms
     * @param {number} [opts.transition=1000] — crossfade duration in ms
     */
    kenBurns: function (target, images, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el || !images || images.length === 0) return;

      var duration = opts.duration || 6000;
      var transition = opts.transition || 1000;
      var currentIndex = 0;
      var running = true;

      // Create two layers for crossfade
      var layerA = document.createElement('div');
      var layerB = document.createElement('div');
      var baseStyle = 'position:absolute;inset:-10%;background-size:cover;background-position:center;z-index:0;transition:opacity ' + transition + 'ms ease;';

      layerA.style.cssText = baseStyle + 'opacity:1;';
      layerB.style.cssText = baseStyle + 'opacity:0;';

      el.insertBefore(layerB, el.firstChild);
      el.insertBefore(layerA, el.firstChild);

      // Predefine zoom/pan variations
      var transforms = [
        'scale(1) translate(0, 0)',
        'scale(1.15) translate(-2%, -1%)',
        'scale(1.1) translate(2%, 1%)',
        'scale(1.2) translate(-1%, 2%)',
        'scale(1.1) translate(1%, -2%)',
      ];

      function showImage(layer, index) {
        layer.style.backgroundImage = 'url(' + images[index] + ')';
        var fromTransform = transforms[index % transforms.length];
        var toIndex = (index + 1) % transforms.length;
        layer.style.transform = transforms[toIndex];

        // Animate Ken Burns
        layer.style.transition = 'opacity ' + transition + 'ms ease, transform ' + duration + 'ms ease-out';
        requestAnimationFrame(function () {
          layer.style.transform = fromTransform;
        });
      }

      function cycle() {
        if (!running) return;
        var activeLayer = currentIndex % 2 === 0 ? layerA : layerB;
        var inactiveLayer = currentIndex % 2 === 0 ? layerB : layerA;

        showImage(activeLayer, currentIndex % images.length);
        activeLayer.style.opacity = '1';
        inactiveLayer.style.opacity = '0';

        currentIndex++;
        setTimeout(cycle, duration);
      }

      showImage(layerA, 0);
      setTimeout(cycle, duration);

      return {
        stop: function () { running = false; },
      };
    },

    /**
     * Scroll-linked parallax for hero layers.
     * Uses data-parallax-speed on .hero-layer elements.
     * @param {string|Element} target
     */
    parallaxLayers: function (target) {
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var layers = el.querySelectorAll('.hero-layer');
      if (!layers.length) return;

      var ticking = false;

      function update() {
        var scrollY = window.pageYOffset;
        var rect = el.getBoundingClientRect();
        var elTop = rect.top + scrollY;
        var progress = (scrollY - elTop) / window.innerHeight;

        Array.from(layers).forEach(function (layer) {
          var speed = parseFloat(layer.dataset.parallaxSpeed || layer.dataset.speed || '0.5');
          var yOffset = progress * speed * 100;
          layer.style.transform = 'translateY(' + yOffset + 'px) scale(1.1)';
        });

        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });

      update();
    },

    /**
     * Staggered text entrance for hero content.
     * Animates children of the target one by one.
     * @param {string|Element} target — .hero-content element
     * @param {object} [opts]
     * @param {number} [opts.delay=100] — stagger delay per child
     * @param {number} [opts.initialDelay=200] — delay before starting
     * @param {string} [opts.animation='fadeInUp'] — animation name
     */
    textReveal: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var delay = opts.delay || 100;
      var initialDelay = opts.initialDelay || 200;
      var animName = opts.animation || 'fadeInUp';

      var children = el.children;

      // Hide all children initially
      Array.from(children).forEach(function (child) {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
      });

      // Reveal with stagger
      setTimeout(function () {
        Array.from(children).forEach(function (child, i) {
          setTimeout(function () {
            child.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          }, i * delay);
        });
      }, initialDelay);
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Heroes;
  } else {
    global.Heroes = Heroes;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
