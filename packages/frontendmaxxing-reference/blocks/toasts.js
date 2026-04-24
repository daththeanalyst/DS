/**
 * toasts.js — Toast notification API
 *
 * Usage:
 *   <script src="toasts.js"></script>
 *   <script>
 *     Toast.show({ message: 'File saved!', type: 'success' });
 *     Toast.show({ message: 'Something went wrong', type: 'error', duration: 6000 });
 *     Toast.show({ message: 'Heads up!', type: 'warning', position: 'top-center' });
 *   </script>
 */

(function (global) {
  'use strict';

  var containers = {};
  var toastIdCounter = 0;

  var icons = {
    success: '\u2713',
    error: '\u2717',
    warning: '\u26A0',
    info: '\u2139',
  };

  function getContainer(position) {
    if (containers[position]) return containers[position];

    var el = document.createElement('div');
    el.className = 'toast-container toast-' + position;
    document.body.appendChild(el);
    containers[position] = el;
    return el;
  }

  var Toast = {
    /**
     * Show a toast notification.
     * @param {object} opts
     * @param {string} opts.message — toast text
     * @param {string} [opts.type='info'] — success, error, warning, info
     * @param {number} [opts.duration=4000] — auto-dismiss in ms (0 = no auto-dismiss)
     * @param {string} [opts.position='top-right'] — top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
     * @param {boolean} [opts.dismissible=true] — show X button
     * @param {boolean} [opts.progress=true] — show progress bar
     * @param {function} [opts.onClick] — click handler
     * @returns {string} — toast ID for dismissal
     */
    show: function (opts) {
      opts = opts || {};
      var type = opts.type || 'info';
      var duration = opts.duration !== undefined ? opts.duration : 4000;
      var position = opts.position || 'top-right';
      var dismissible = opts.dismissible !== false;
      var showProgress = opts.progress !== false && duration > 0;

      var id = 'toast-' + (++toastIdCounter);
      var container = getContainer(position);

      // Build toast
      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.id = id;

      // Icon
      var icon = document.createElement('span');
      icon.className = 'toast-icon';
      icon.textContent = icons[type] || icons.info;
      toast.appendChild(icon);

      // Message
      var msg = document.createElement('span');
      msg.className = 'toast-message';
      msg.textContent = opts.message || '';
      toast.appendChild(msg);

      // Dismiss button
      if (dismissible) {
        var btn = document.createElement('button');
        btn.className = 'toast-dismiss';
        btn.innerHTML = '&times;';
        btn.setAttribute('aria-label', 'Dismiss');
        btn.addEventListener('click', function () { Toast.dismiss(id); });
        toast.appendChild(btn);
      }

      // Progress bar
      if (showProgress) {
        var progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.setProperty('--toast-duration', duration + 'ms');
        toast.appendChild(progress);
      }

      // Click handler
      if (opts.onClick) {
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', function (e) {
          if (!e.target.closest('.toast-dismiss')) {
            opts.onClick();
          }
        });
      }

      // Add to container
      if (position.startsWith('bottom')) {
        container.insertBefore(toast, container.firstChild);
      } else {
        container.appendChild(toast);
      }

      // Auto dismiss
      var timeoutId;
      if (duration > 0) {
        timeoutId = setTimeout(function () {
          Toast.dismiss(id);
        }, duration);
      }

      // Pause on hover
      toast.addEventListener('mouseenter', function () {
        if (timeoutId) clearTimeout(timeoutId);
        var prog = toast.querySelector('.toast-progress');
        if (prog) prog.style.animationPlayState = 'paused';
      });

      toast.addEventListener('mouseleave', function () {
        if (duration > 0) {
          timeoutId = setTimeout(function () {
            Toast.dismiss(id);
          }, 1500);
        }
        var prog = toast.querySelector('.toast-progress');
        if (prog) prog.style.animationPlayState = 'running';
      });

      return id;
    },

    /**
     * Dismiss a specific toast.
     * @param {string} id
     */
    dismiss: function (id) {
      var toast = document.getElementById(id);
      if (!toast) return;

      toast.classList.add('toast-exiting');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    },

    /**
     * Dismiss all toasts.
     */
    dismissAll: function () {
      Object.keys(containers).forEach(function (key) {
        var container = containers[key];
        var toasts = container.querySelectorAll('.toast');
        toasts.forEach(function (toast) {
          toast.classList.add('toast-exiting');
        });
        setTimeout(function () {
          container.innerHTML = '';
        }, 250);
      });
    },

    /**
     * Shorthand methods.
     */
    success: function (message, opts) {
      return Toast.show(Object.assign({ message: message, type: 'success' }, opts || {}));
    },
    error: function (message, opts) {
      return Toast.show(Object.assign({ message: message, type: 'error' }, opts || {}));
    },
    warning: function (message, opts) {
      return Toast.show(Object.assign({ message: message, type: 'warning' }, opts || {}));
    },
    info: function (message, opts) {
      return Toast.show(Object.assign({ message: message, type: 'info' }, opts || {}));
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
  } else {
    global.Toast = Toast;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
