/* ============================================
   DRAGGABLE — macOS-style draggable panels
   Inspired by ssscript.app
   ============================================
   Usage:
     Draggable.init('.panel');
     Draggable.init('.panel', {
       handle: '.panel-header',   // drag handle selector
       bounds: true,              // keep within viewport
       stack: true,               // click-to-front z-index
       snap: false,               // snap to grid
       snapSize: 20               // grid size in px
     });
   ============================================ */
(function (root) {
  'use strict';

  var zCounter = 100;

  var defaults = {
    handle: null,       // selector for drag handle (null = whole element)
    bounds: true,       // constrain to viewport
    stack: true,        // bring to front on click
    snap: false,        // snap to grid
    snapSize: 20,
    onDragStart: null,
    onDrag: null,
    onDragEnd: null
  };

  function init(target, opts) {
    var els = typeof target === 'string'
      ? document.querySelectorAll(target)
      : [target];
    var instances = [];
    els.forEach(function (el) { instances.push(createInstance(el, opts)); });
    return instances.length === 1 ? instances[0] : instances;
  }

  function createInstance(el, opts) {
    var o = {};
    for (var k in defaults) o[k] = defaults[k];
    if (opts) for (var k2 in opts) o[k2] = opts[k2];

    var handle = o.handle ? el.querySelector(o.handle) : el;
    if (!handle) handle = el;

    var isDragging = false;
    var startX = 0, startY = 0;
    var elX = 0, elY = 0;
    var currentX = 0, currentY = 0;

    // Ensure element is positioned
    var pos = getComputedStyle(el).position;
    if (pos === 'static') el.style.position = 'relative';

    // Get initial transform offset
    var transform = getComputedStyle(el).transform;
    if (transform && transform !== 'none') {
      var matrix = transform.match(/matrix.*\((.+)\)/);
      if (matrix) {
        var vals = matrix[1].split(', ');
        currentX = parseFloat(vals[4]) || 0;
        currentY = parseFloat(vals[5]) || 0;
      }
    }

    handle.style.cursor = 'grab';
    handle.style.userSelect = 'none';
    handle.style.touchAction = 'none';

    function onPointerDown(e) {
      if (e.button !== 0) return; // left click only
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      elX = currentX;
      elY = currentY;

      handle.style.cursor = 'grabbing';
      el.style.transition = 'none';
      el.style.willChange = 'transform';

      if (o.stack) {
        zCounter++;
        el.style.zIndex = zCounter;
      }

      if (o.onDragStart) o.onDragStart(el, e);

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newX = elX + dx;
      var newY = elY + dy;

      if (o.snap) {
        newX = Math.round(newX / o.snapSize) * o.snapSize;
        newY = Math.round(newY / o.snapSize) * o.snapSize;
      }

      if (o.bounds) {
        var rect = el.getBoundingClientRect();
        var parentW = window.innerWidth;
        var parentH = window.innerHeight;

        // Keep at least 40px visible
        var minVisible = 40;
        var maxLeft = parentW - minVisible;
        var maxTop = parentH - minVisible;
        var minLeft = -(rect.width - minVisible);
        var minTop = -(rect.height - minVisible);

        // Adjust for current position offset
        var baseLeft = rect.left - currentX;
        var baseTop = rect.top - currentY;

        if (baseLeft + newX < minLeft) newX = minLeft - baseLeft;
        if (baseLeft + newX > maxLeft) newX = maxLeft - baseLeft;
        if (baseTop + newY < minTop) newY = minTop - baseTop;
        if (baseTop + newY > maxTop) newY = maxTop - baseTop;
      }

      currentX = newX;
      currentY = newY;
      el.style.transform = 'translate3d(' + newX + 'px, ' + newY + 'px, 0)';

      if (o.onDrag) o.onDrag(el, { x: newX, y: newY }, e);
    }

    function onPointerUp(e) {
      isDragging = false;
      handle.style.cursor = 'grab';
      el.style.willChange = '';

      if (o.onDragEnd) o.onDragEnd(el, { x: currentX, y: currentY }, e);

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    // Bring to front on click
    if (o.stack) {
      el.addEventListener('pointerdown', function () {
        zCounter++;
        el.style.zIndex = zCounter;
      });
    }

    handle.addEventListener('pointerdown', onPointerDown);

    function destroy() {
      handle.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    function setPosition(x, y) {
      currentX = x;
      currentY = y;
      el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    }

    return { el: el, destroy: destroy, setPosition: setPosition };
  }

  var Draggable = { init: init };

  if (typeof module !== 'undefined' && module.exports) module.exports = Draggable;
  else root.Draggable = Draggable;
})(typeof window !== 'undefined' ? window : this);
