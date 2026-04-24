/**
 * forms.js — Floating label, inline validation, step wizard, password strength
 *
 * Usage:
 *   <script src="forms.js"></script>
 *   <script>
 *     // Activate floating labels
 *     Forms.floatingLabel('.input-float');
 *
 *     // Inline validation
 *     Forms.validate('#my-form', {
 *       email: { required: true, email: true },
 *       password: { required: true, minLength: 8 },
 *     });
 *
 *     // Step wizard
 *     Forms.stepWizard('#wizard', {
 *       onStep: (step) => console.log('Step', step),
 *     });
 *
 *     // Password strength meter
 *     Forms.passwordStrength('#password-input');
 *   </script>
 */

(function (global) {
  'use strict';

  var Forms = {
    /**
     * Activate floating label behavior.
     * Adds .has-value class when input has content.
     * @param {string|Element|NodeList} target — .input-float containers
     */
    floatingLabel: function (target) {
      var els = typeof target === 'string'
        ? document.querySelectorAll(target)
        : target instanceof Element ? [target] : target;

      Array.from(els).forEach(function (container) {
        var input = container.querySelector('input, textarea, select');
        if (!input) return;

        function check() {
          container.classList.toggle('has-value', input.value.length > 0);
        }

        input.addEventListener('input', check);
        input.addEventListener('change', check);
        check(); // Initial check
      });
    },

    /**
     * Inline form validation.
     * @param {string|Element} form — form element
     * @param {object} rules — { fieldName: { required, email, minLength, maxLength, pattern, match, custom } }
     * @param {object} [opts]
     * @param {boolean} [opts.validateOnBlur=true]
     * @param {boolean} [opts.validateOnInput=false]
     * @param {boolean} [opts.showErrors=true]
     * @returns {{ validate: function, isValid: function }}
     */
    validate: function (form, rules, opts) {
      opts = opts || {};
      var formEl = typeof form === 'string' ? document.querySelector(form) : form;
      if (!formEl) return;

      var validateOnBlur = opts.validateOnBlur !== false;
      var validateOnInput = opts.validateOnInput || false;

      var messages = {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minLength: 'Must be at least {n} characters',
        maxLength: 'Must be no more than {n} characters',
        pattern: 'Invalid format',
        match: 'Fields do not match',
      };

      function validateField(name) {
        var rule = rules[name];
        if (!rule) return null;

        var input = formEl.querySelector('[name="' + name + '"]');
        if (!input) return null;

        var value = input.value.trim();
        var errors = [];

        if (rule.required && !value) {
          errors.push(messages.required);
        }

        if (value) {
          if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(messages.email);
          }
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(messages.minLength.replace('{n}', rule.minLength));
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(messages.maxLength.replace('{n}', rule.maxLength));
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.patternMessage || messages.pattern);
          }
          if (rule.match) {
            var matchInput = formEl.querySelector('[name="' + rule.match + '"]');
            if (matchInput && value !== matchInput.value) {
              errors.push(messages.match);
            }
          }
          if (rule.custom) {
            var customError = rule.custom(value, input);
            if (customError) errors.push(customError);
          }
        }

        // Update UI
        var group = input.closest('.form-group') || input.parentElement;
        var existingError = group.querySelector('.form-error-text');
        if (existingError) existingError.remove();

        if (errors.length > 0) {
          group.classList.add('error');
          group.classList.remove('success');
          if (opts.showErrors !== false) {
            var errorEl = document.createElement('div');
            errorEl.className = 'form-error-text';
            errorEl.textContent = errors[0];
            group.appendChild(errorEl);
          }
          return errors;
        } else if (value) {
          group.classList.remove('error');
          group.classList.add('success');
        } else {
          group.classList.remove('error', 'success');
        }

        return null;
      }

      // Bind events
      Object.keys(rules).forEach(function (name) {
        var input = formEl.querySelector('[name="' + name + '"]');
        if (!input) return;

        if (validateOnBlur) {
          input.addEventListener('blur', function () { validateField(name); });
        }
        if (validateOnInput) {
          input.addEventListener('input', function () { validateField(name); });
        }
      });

      // Prevent submit if invalid
      formEl.addEventListener('submit', function (e) {
        var allValid = true;
        Object.keys(rules).forEach(function (name) {
          var errors = validateField(name);
          if (errors) allValid = false;
        });
        if (!allValid) e.preventDefault();
      });

      return {
        validate: function () {
          var valid = true;
          Object.keys(rules).forEach(function (name) {
            if (validateField(name)) valid = false;
          });
          return valid;
        },
        isValid: function () {
          var valid = true;
          Object.keys(rules).forEach(function (name) {
            var input = formEl.querySelector('[name="' + name + '"]');
            if (!input) return;
            var rule = rules[name];
            var value = input.value.trim();
            if (rule.required && !value) valid = false;
            if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) valid = false;
          });
          return valid;
        },
      };
    },

    /**
     * Multi-step form wizard.
     * @param {string|Element} target
     * @param {object} [opts]
     * @param {function} [opts.onStep] — called with step index when step changes
     * @param {function} [opts.onComplete] — called when last step is reached
     */
    stepWizard: function (target, opts) {
      opts = opts || {};
      var el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      var steps = el.querySelectorAll('.wizard-step');
      var indicators = el.querySelectorAll('.step-wizard .step');
      var prevBtn = el.querySelector('[data-wizard-prev]');
      var nextBtn = el.querySelector('[data-wizard-next]');
      var currentStep = 0;

      function showStep(index) {
        steps.forEach(function (step, i) {
          step.style.display = i === index ? '' : 'none';
        });

        indicators.forEach(function (ind, i) {
          ind.classList.remove('active', 'completed');
          if (i < index) ind.classList.add('completed');
          if (i === index) ind.classList.add('active');
        });

        if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : '';
        if (nextBtn) {
          nextBtn.textContent = index === steps.length - 1 ? 'Submit' : 'Next';
        }

        currentStep = index;
        if (opts.onStep) opts.onStep(index);
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
          } else {
            if (opts.onComplete) opts.onComplete();
          }
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function (e) {
          e.preventDefault();
          if (currentStep > 0) showStep(currentStep - 1);
        });
      }

      showStep(0);

      return {
        goTo: showStep,
        next: function () { if (currentStep < steps.length - 1) showStep(currentStep + 1); },
        prev: function () { if (currentStep > 0) showStep(currentStep - 1); },
        current: function () { return currentStep; },
      };
    },

    /**
     * Password strength meter.
     * @param {string|Element} input
     * @param {object} [opts]
     * @param {string|Element} [opts.meter] — progress bar element
     */
    passwordStrength: function (input, opts) {
      opts = opts || {};
      var inputEl = typeof input === 'string' ? document.querySelector(input) : input;
      if (!inputEl) return;

      // Create meter if not provided
      var meterEl;
      if (opts.meter) {
        meterEl = typeof opts.meter === 'string' ? document.querySelector(opts.meter) : opts.meter;
      } else {
        meterEl = document.createElement('div');
        meterEl.style.cssText = 'width:100%;height:4px;background:var(--border,#2d2d3f);border-radius:2px;margin-top:0.5rem;overflow:hidden;';
        var meterBar = document.createElement('div');
        meterBar.style.cssText = 'height:100%;width:0%;transition:width 0.3s ease,background 0.3s ease;border-radius:2px;';
        meterEl.appendChild(meterBar);
        inputEl.parentElement.appendChild(meterEl);
        meterEl = meterBar;
      }

      inputEl.addEventListener('input', function () {
        var val = inputEl.value;
        var score = 0;

        if (val.length >= 8) score++;
        if (val.length >= 12) score++;
        if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^a-zA-Z0-9]/.test(val)) score++;

        var percent = Math.min(score / 5 * 100, 100);
        var colors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
        var color = colors[Math.min(score, colors.length) - 1] || '#ef4444';

        meterEl.style.width = percent + '%';
        meterEl.style.background = val.length > 0 ? color : 'transparent';
      });
    },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Forms;
  } else {
    global.Forms = Forms;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
