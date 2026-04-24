/**
 * testimonials.js — Auto-rotate carousel with touch swipe
 *
 * Usage:
 *   <script src="testimonials.js"></script>
 *   <script>
 *     Testimonials.carousel('.testimonial-carousel', {
 *       autoplay: true,
 *       interval: 5000,
 *       pauseOnHover: true,
 *     });
 *   </script>
 */

(function (global) {
  'use strict';

  var Testimonials = {
    /**
     * Initialize testimonial carousel.
     * @param {string|Element} target — .testimonial-carousel container
     * @param {object} [opts]
     * @param {boolean} [opts.autoplay=true]
     * @param {number} [opts.interval=5000] — ms between slides
     * @param {boolean} [opts.pauseOnHover=true]
     * @param {boolean} [opts.dots=true] — show dot indicators
     * @param {boolean} [opts.swipe=true] — enable touch swipe
     */
    carousel: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var track = el.querySelector('.testimonial-carousel-track');
      if (!track) return;

      var slides = track.children;
      var count = slides.length;
      if (count <= 1) return;

      var current = 0;
      var autoplay = opts.autoplay !== false;
      var interval = opts.interval || 5000;
      var paused = false;
      var autoplayTimer = null;

      function goTo(index) {
        current = ((index % count) + count) % count;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';

        // Update dots
        var dots = el.querySelectorAll('.testimonial-carousel-dot');
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }

      // Create dots
      if (opts.dots !== false) {
        var dotsContainer = el.querySelector('.testimonial-carousel-dots');
        if (!dotsContainer) {
          dotsContainer = document.createElement('div');
          dotsContainer.className = 'testimonial-carousel-dots';
          el.appendChild(dotsContainer);
        }
        dotsContainer.innerHTML = '';
        for (var i = 0; i < count; i++) {
          var dot = document.createElement('button');
          dot.className = 'testimonial-carousel-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Slide ' + (i + 1));
          (function (idx) {
            dot.addEventListener('click', function () { goTo(idx); });
          })(i);
          dotsContainer.appendChild(dot);
        }
      }

      // Nav arrows
      var prevBtn = el.querySelector('.testimonial-carousel-prev');
      var nextBtn = el.querySelector('.testimonial-carousel-next');
      if (prevBtn) prevBtn.addEventListener('click', prev);
      if (nextBtn) nextBtn.addEventListener('click', next);

      // Autoplay
      function startAutoplay() {
        if (!autoplay) return;
        autoplayTimer = setInterval(function () {
          if (!paused) next();
        }, interval);
      }

      function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
      }

      if (opts.pauseOnHover !== false) {
        el.addEventListener('mouseenter', function () { paused = true; });
        el.addEventListener('mouseleave', function () { paused = false; });
      }

      // Touch swipe
      if (opts.swipe !== false) {
        var startX = 0;
        var startY = 0;
        var isDragging = false;

        track.addEventListener('touchstart', function (e) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
          if (!isDragging) return;
          isDragging = false;
          var endX = e.changedTouches[0].clientX;
          var endY = e.changedTouches[0].clientY;
          var diffX = startX - endX;
          var diffY = Math.abs(startY - endY);

          // Only trigger if horizontal swipe is dominant
          if (Math.abs(diffX) > 50 && diffY < Math.abs(diffX)) {
            if (diffX > 0) next();
            else prev();
          }
        }, { passive: true });
      }

      startAutoplay();
      goTo(0);

      return {
        next: next,
        prev: prev,
        goTo: goTo,
        destroy: function () { stopAutoplay(); },
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Testimonials;
  } else {
    global.Testimonials = Testimonials;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
