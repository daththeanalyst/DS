/**
 * dom.js — querySelector helpers, class toggling, data attributes
 *
 * Usage:
 *   <script src="dom.js"></script>
 *   <script>
 *     const el = $(".card");          // querySelector
 *     const els = $$(".card");        // querySelectorAll (returns array)
 *     DOM.addClass(el, "active");
 *     DOM.toggle(el, "visible");
 *     DOM.onReady(() => console.log("DOM loaded"));
 *     DOM.on(el, "click", handler);
 *   </script>
 */

(function (global) {
  'use strict';

  /**
   * querySelector shorthand.
   * @param {string} selector
   * @param {Element} [parent=document]
   * @returns {Element|null}
   */
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  /**
   * querySelectorAll → Array.
   * @param {string} selector
   * @param {Element} [parent=document]
   * @returns {Element[]}
   */
  function $$(selector, parent) {
    return Array.from((parent || document).querySelectorAll(selector));
  }

  var DOM = {
    $: $,
    $$: $$,

    /**
     * Add class(es) to element.
     */
    addClass: function (el, classes) {
      classes.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
    },

    /**
     * Remove class(es) from element.
     */
    removeClass: function (el, classes) {
      classes.split(' ').forEach(function (c) { if (c) el.classList.remove(c); });
    },

    /**
     * Toggle class on element.
     * @param {Element} el
     * @param {string} className
     * @param {boolean} [force]
     */
    toggle: function (el, className, force) {
      return el.classList.toggle(className, force);
    },

    /**
     * Check if element has class.
     */
    hasClass: function (el, className) {
      return el.classList.contains(className);
    },

    /**
     * Set/get data attribute.
     * DOM.data(el, 'color')           → get
     * DOM.data(el, 'color', 'red')    → set
     */
    data: function (el, key, value) {
      if (value === undefined) {
        return el.dataset[key];
      }
      el.dataset[key] = value;
      return el;
    },

    /**
     * Set CSS custom property.
     */
    setCSSVar: function (el, name, value) {
      el.style.setProperty(name.startsWith('--') ? name : '--' + name, value);
    },

    /**
     * Get CSS custom property.
     */
    getCSSVar: function (el, name) {
      return getComputedStyle(el).getPropertyValue(name.startsWith('--') ? name : '--' + name).trim();
    },

    /**
     * Add event listener (returns cleanup function).
     */
    on: function (el, event, handler, options) {
      el.addEventListener(event, handler, options);
      return function () { el.removeEventListener(event, handler, options); };
    },

    /**
     * Add event listener that fires once.
     */
    once: function (el, event, handler) {
      el.addEventListener(event, handler, { once: true });
    },

    /**
     * Delegate event listener.
     * DOM.delegate(document, 'click', '.btn', (e, target) => { ... })
     */
    delegate: function (parent, event, selector, handler) {
      function delegatedHandler(e) {
        var target = e.target.closest(selector);
        if (target && parent.contains(target)) {
          handler(e, target);
        }
      }
      parent.addEventListener(event, delegatedHandler);
      return function () { parent.removeEventListener(event, delegatedHandler); };
    },

    /**
     * Run callback when DOM is ready.
     */
    onReady: function (fn) {
      if (document.readyState !== 'loading') {
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
      }
    },

    /**
     * Create element with attributes and children.
     * DOM.create('div', { class: 'card', id: 'main' }, [childEl, 'text'])
     */
    create: function (tag, attrs, children) {
      var el = document.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) {
          if (key === 'class') {
            el.className = attrs[key];
          } else if (key === 'style' && typeof attrs[key] === 'object') {
            Object.assign(el.style, attrs[key]);
          } else if (key.startsWith('on')) {
            el.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
          } else {
            el.setAttribute(key, attrs[key]);
          }
        });
      }
      if (children) {
        (Array.isArray(children) ? children : [children]).forEach(function (child) {
          if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
          } else if (child instanceof Node) {
            el.appendChild(child);
          }
        });
      }
      return el;
    },

    /**
     * Get element dimensions and position.
     */
    rect: function (el) {
      return el.getBoundingClientRect();
    },

    /**
     * Scroll element into view smoothly.
     */
    scrollTo: function (el, opts) {
      el.scrollIntoView(Object.assign({ behavior: 'smooth', block: 'start' }, opts));
    },

    /**
     * Wait for transition/animation to finish.
     * @returns {Promise}
     */
    afterTransition: function (el) {
      return new Promise(function (resolve) {
        function handler(e) {
          if (e.target === el) {
            el.removeEventListener('transitionend', handler);
            resolve(e);
          }
        }
        el.addEventListener('transitionend', handler);
      });
    },

    afterAnimation: function (el) {
      return new Promise(function (resolve) {
        function handler(e) {
          if (e.target === el) {
            el.removeEventListener('animationend', handler);
            resolve(e);
          }
        }
        el.addEventListener('animationend', handler);
      });
    },
  };

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOM;
  } else {
    global.DOM = DOM;
    global.$ = $;
    global.$$ = $$;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
