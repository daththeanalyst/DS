/**
 * navbars.js — Scroll-aware hide/shrink, hamburger morph, mega menu, active link
 *
 * Usage:
 *   <script src="navbars.js"></script>
 *   <script>
 *     // Auto-hide on scroll down, show on scroll up
 *     Nav.scrollAware('nav', { hideOnDown: true, shrinkOnScroll: true });
 *
 *     // Hamburger toggle with menu
 *     Nav.hamburger('.nav-hamburger', '.nav-menu-mobile');
 *
 *     // Mega menu dropdown
 *     Nav.megaMenu('.nav-mega');
 *
 *     // Highlight active section link on scroll
 *     Nav.activeLink('nav', { offset: 100 });
 *   </script>
 */

(function (global) {
  'use strict';

  var Nav = {
    /**
     * Scroll-aware navbar: hide/show/shrink based on scroll direction.
     * Adds .nav-scrolled when scrolled past threshold.
     * Adds .nav-hidden when scrolling down (if hideOnDown).
     * Adds .nav-shrink when scrolled (if shrinkOnScroll).
     * @param {string|Element} target
     * @param {object} [opts]
     * @param {boolean} [opts.hideOnDown=true] — hide when scrolling down
     * @param {boolean} [opts.shrinkOnScroll=false] — shrink navbar when scrolled
     * @param {number} [opts.threshold=50] — scroll distance before activating
     */
    scrollAware: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var hideOnDown = opts.hideOnDown !== false;
      var shrink = opts.shrinkOnScroll || false;
      var threshold = opts.threshold || 50;
      var lastScrollY = 0;
      var ticking = false;

      function update() {
        var scrollY = window.pageYOffset;
        var isScrolled = scrollY > threshold;

        // Scrolled state (transparent → solid, etc.)
        el.classList.toggle('nav-scrolled', isScrolled);

        // Shrink
        if (shrink) {
          el.classList.toggle('nav-shrink', isScrolled);
        }

        // Hide on scroll down
        if (hideOnDown && isScrolled) {
          var isDown = scrollY > lastScrollY && scrollY - lastScrollY > 5;
          var isUp = scrollY < lastScrollY && lastScrollY - scrollY > 5;
          if (isDown) el.classList.add('nav-hidden');
          if (isUp) el.classList.remove('nav-hidden');
        } else {
          el.classList.remove('nav-hidden');
        }

        lastScrollY = scrollY;
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
     * Hamburger menu toggle.
     * @param {string|Element} btn — hamburger button
     * @param {string|Element} menu — mobile menu panel
     * @param {object} [opts]
     * @param {boolean} [opts.closeOnLinkClick=true]
     * @param {boolean} [opts.lockScroll=true]
     */
    hamburger: function (btn, menu, opts) {
      opts = opts || {};
      var btnEl = typeof btn === 'string' ? document.querySelector(btn) : btn;
      var menuEl = typeof menu === 'string' ? document.querySelector(menu) : menu;
      if (!btnEl || !menuEl) return;

      var closeOnLink = opts.closeOnLinkClick !== false;
      var lockScroll = opts.lockScroll !== false;
      var isOpen = false;

      function toggle() {
        isOpen = !isOpen;
        btnEl.classList.toggle('active', isOpen);
        menuEl.classList.toggle('open', isOpen);
        btnEl.setAttribute('aria-expanded', isOpen);

        if (lockScroll) {
          document.body.style.overflow = isOpen ? 'hidden' : '';
        }
      }

      function close() {
        if (isOpen) toggle();
      }

      btnEl.addEventListener('click', toggle);

      // Close on link click
      if (closeOnLink) {
        menuEl.addEventListener('click', function (e) {
          if (e.target.closest('.nav-link, a')) close();
        });
      }

      // Close on ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) close();
      });

      return { toggle: toggle, close: close };
    },

    /**
     * Mega menu dropdown behavior.
     * Expects .nav-link[data-mega] triggers and .nav-mega-panel[data-mega] panels.
     * @param {string|Element} nav — nav container
     */
    megaMenu: function (nav) {
      var el = typeof nav === 'string' ? document.querySelector(nav) : nav;
      if (!el) return;

      var triggers = el.querySelectorAll('[data-mega]');
      var panels = el.querySelectorAll('.nav-mega-panel');
      var closeTimer = null;

      function openPanel(name) {
        clearTimeout(closeTimer);
        panels.forEach(function (p) {
          p.classList.toggle('open', p.dataset.mega === name);
        });
      }

      function closeAll() {
        closeTimer = setTimeout(function () {
          panels.forEach(function (p) { p.classList.remove('open'); });
        }, 200);
      }

      triggers.forEach(function (trigger) {
        trigger.addEventListener('mouseenter', function () {
          openPanel(trigger.dataset.mega);
        });
        trigger.addEventListener('mouseleave', closeAll);
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          var panel = el.querySelector('.nav-mega-panel[data-mega="' + trigger.dataset.mega + '"]');
          if (panel) panel.classList.toggle('open');
        });
      });

      panels.forEach(function (panel) {
        panel.addEventListener('mouseenter', function () {
          clearTimeout(closeTimer);
        });
        panel.addEventListener('mouseleave', closeAll);
      });
    },

    /**
     * Highlight nav link matching current scroll section.
     * Expects .nav-link[href="#section-id"] format.
     * @param {string|Element} nav
     * @param {object} [opts]
     * @param {number} [opts.offset=100] — offset from top for activation
     */
    activeLink: function (nav, opts) {
      opts = opts || {};
      var el = typeof nav === 'string' ? document.querySelector(nav) : nav;
      if (!el) return;

      var offset = opts.offset || 100;
      var links = el.querySelectorAll('.nav-link[href^="#"]');
      var sections = [];

      links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href.length > 1) {
          var section = document.querySelector(href);
          if (section) {
            sections.push({ link: link, section: section });
          }
        }
      });

      if (!sections.length) return;

      var ticking = false;

      function update() {
        var scrollY = window.pageYOffset + offset;
        var active = null;

        sections.forEach(function (item) {
          if (item.section.offsetTop <= scrollY) {
            active = item;
          }
        });

        links.forEach(function (l) { l.classList.remove('active'); });
        if (active) active.link.classList.add('active');
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
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Nav;
  } else {
    global.Nav = Nav;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
