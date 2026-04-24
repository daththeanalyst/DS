/**
 * modals.js — Open/close with animations, morph-from-trigger, focus trap
 *
 * Usage:
 *   <script src="modals.js"></script>
 *   <script>
 *     // Open a modal
 *     Modal.open('#my-modal');
 *
 *     // Close
 *     Modal.close('#my-modal');
 *
 *     // Bind trigger buttons: data-modal-open="#my-modal"
 *     Modal.bindTriggers();
 *
 *     // Morph from trigger element (FLIP animation)
 *     Modal.morph('#trigger-btn', '#my-modal');
 *   </script>
 */

(function (global) {
  'use strict';

  var openModals = [];

  var Modal = {
    /**
     * Open a modal by selector or element.
     * @param {string|Element} target — .modal-backdrop element
     * @param {object} [opts]
     * @param {function} [opts.onOpen]
     * @param {boolean} [opts.closeOnBackdrop=true]
     * @param {boolean} [opts.closeOnEsc=true]
     * @param {boolean} [opts.lockScroll=true]
     */
    open: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      // Open
      el.classList.add('modal-open');

      // Lock scroll
      if (opts.lockScroll !== false) {
        document.body.classList.add('body-modal-open');
      }

      // Track open modals
      if (openModals.indexOf(el) === -1) openModals.push(el);

      // Focus trap
      var focusable = el.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();

      // Close on backdrop click
      if (opts.closeOnBackdrop !== false) {
        el._backdropHandler = function (e) {
          if (e.target === el) Modal.close(el);
        };
        el.addEventListener('click', el._backdropHandler);
      }

      // Close on ESC
      if (opts.closeOnEsc !== false) {
        el._escHandler = function (e) {
          if (e.key === 'Escape') Modal.close(el);
        };
        document.addEventListener('keydown', el._escHandler);
      }

      // Close button
      var closeBtn = el.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn._closeHandler = function () { Modal.close(el); };
        closeBtn.addEventListener('click', closeBtn._closeHandler);
      }

      // Focus trap handler
      el._trapHandler = function (e) {
        if (e.key !== 'Tab' || !focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      el.addEventListener('keydown', el._trapHandler);

      if (opts.onOpen) opts.onOpen(el);
    },

    /**
     * Close a modal.
     * @param {string|Element} target
     * @param {object} [opts]
     * @param {function} [opts.onClose]
     */
    close: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      el.classList.remove('modal-open');

      // Cleanup listeners
      if (el._backdropHandler) {
        el.removeEventListener('click', el._backdropHandler);
        el._backdropHandler = null;
      }
      if (el._escHandler) {
        document.removeEventListener('keydown', el._escHandler);
        el._escHandler = null;
      }
      if (el._trapHandler) {
        el.removeEventListener('keydown', el._trapHandler);
        el._trapHandler = null;
      }

      var closeBtn = el.querySelector('.modal-close');
      if (closeBtn && closeBtn._closeHandler) {
        closeBtn.removeEventListener('click', closeBtn._closeHandler);
        closeBtn._closeHandler = null;
      }

      // Remove from tracking
      var idx = openModals.indexOf(el);
      if (idx !== -1) openModals.splice(idx, 1);

      // Unlock scroll if no modals open
      if (openModals.length === 0) {
        document.body.classList.remove('body-modal-open');
      }

      if (opts.onClose) opts.onClose(el);
    },

    /**
     * Bind all trigger elements with data-modal-open attribute.
     * <button data-modal-open="#my-modal">Open</button>
     */
    bindTriggers: function () {
      document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-modal-open]');
        if (trigger) {
          e.preventDefault();
          var selector = trigger.dataset.modalOpen;
          Modal.open(selector);
        }

        var closeTrigger = e.target.closest('[data-modal-close]');
        if (closeTrigger) {
          e.preventDefault();
          var closeSelector = closeTrigger.dataset.modalClose;
          if (closeSelector) {
            Modal.close(closeSelector);
          } else {
            var backdrop = closeTrigger.closest('.modal-backdrop');
            if (backdrop) Modal.close(backdrop);
          }
        }
      });
    },

    /**
     * Morph animation from trigger element to modal (FLIP technique).
     * @param {string|Element} trigger — the element to morph from
     * @param {string|Element} modal — the .modal-backdrop
     */
    morph: function (trigger, modal) {
      var triggerEl = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
      var modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
      if (!triggerEl || !modalEl) return;

      triggerEl.addEventListener('click', function () {
        var triggerRect = triggerEl.getBoundingClientRect();
        var modalContent = modalEl.querySelector('[class*="modal-"]:not(.modal-backdrop)') || modalEl.firstElementChild;
        if (!modalContent) return;

        // FLIP: First
        modalContent.style.transformOrigin = 'top left';
        modalContent.style.position = 'fixed';
        modalContent.style.left = triggerRect.left + 'px';
        modalContent.style.top = triggerRect.top + 'px';
        modalContent.style.width = triggerRect.width + 'px';
        modalContent.style.height = triggerRect.height + 'px';
        modalContent.style.borderRadius = getComputedStyle(triggerEl).borderRadius;
        modalContent.style.transition = 'none';

        Modal.open(modalEl);

        // FLIP: Last + Invert + Play
        requestAnimationFrame(function () {
          modalContent.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          modalContent.style.position = '';
          modalContent.style.left = '';
          modalContent.style.top = '';
          modalContent.style.width = '';
          modalContent.style.height = '';
          modalContent.style.borderRadius = '';
          modalContent.style.transformOrigin = '';
        });
      });
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
  } else {
    global.Modal = Modal;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
