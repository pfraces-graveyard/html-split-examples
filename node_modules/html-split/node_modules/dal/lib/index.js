dal = function (selector) {

  /**
   *  # Selector
   */

  var sel = function (selector) {
    var select;
    if (selector) {
      if (typeof selector === 'object') select = selector;
      if (typeof selector === 'string') {
        select = document.getElementById(selector);
      }
    } else select = document.createElement('div');
    return select;
  }

  /**
   *  # Inicialization
   */

  // Exit if selection cannot be accomplished
  var node = sel(selector);
  if (!node) return undefined;

  // Augment node with `sel`, the selector function
  node.sel = sel;

  // Save original settings
  var orig = {
    display:    node.style.display
  , overflow:   node.style.overflow
  , position:   node.style.position
  }

  /**
   *  # Boolean methods
   *
   *  This methods checks for something returning a boolean result, so none
   *  of them is chainable
   */

  node.inside = function (el) {
    var parent = node.parentNode;
    while (parent) {
      if (parent == el) return true;
      parent = parent.parentNode;
    }
    return false;
  }

  node.full = function () {
    node.style.overflow = 'hidden';
    var isOverflowing = node.clientWidth < node.scrollWidth ||
                        node.clientHeight < node.scrollHeight;
    node.style.overflow = orig.overflow;
    return isOverflowing;
  }

  node.empty = function () {
    return node.firstChild;
  }

  /**
   *  # Tools
   *
   *  The rest is a collection of useful methods for managing the DOM
   *  Every one of them is chainable
   *
   *  ## Element management methods
   */

  node.attach = function () {
    if (!node.inside(document.body)) document.body.appendChild(node);
    return node;
  }

  node.detach = function () {
    if (node.parentNode) node.parentNode.removeChild(node);
    return node;
  }

  node.add = function (elm, content) {
    var el = typeof elm === 'object' ? elm : document.createElement(elm);
    if (content) el.appendChild(document.createTextNode(content));
    node.appendChild(el);
    return node;
  }

  node.del = function (el) {
    var target = dal(el);
    if (target.inside(node)) target.detach();
    return node;
  }

  node.clear = function () {
    while (!node.empty()) node.removeChild(node.firstChild);
    return node;
  }

  node.copy = function () {
    var clone = node.cloneNode(false);
    for (var i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].nodeType === 3) {
        clone.appendChild(node.childNodes[i]);
      }
    }
    return clone;
  }

  node.clone = function () {
    return dal(node.cloneNode(true));
  }

  /**
   *  ## CSS layout methods
   */

  node.show = function () {
    node.style.position = orig.position;
    node.style.visibility = 'visible';
    return node;
  }

  node.hide = function () {
    node.style.position = 'absolute';
    node.style.visibility = 'hidden';
    return node;
  }

  node.move = function (x, y) {
    node.style.position = 'absolute';
    node.style.left = x; 
    node.style.top = y;
    return node;
  }

  /**
   *  ## CSS style methods
   */

  node.color = function (opts) {
    node.style.background = opts.bg;
    node.style.color = opts.fg;
    return node;
  }

  node.size = function (opts) {
    node.style.width = opts.width;
    node.style.height = opts.height;
    return node;
  }

  /**
   *  ## Tag attribute methods
   */

  node.class = {
    add: function (className) {
      node.className += ' ' + className;
      return node;
    }
  }

  /**
   *  ## Misc property methods
   *
   *  Chaining useful property definitions
   */

  node.html = function (html) {
    node.innerHTML = html;
    return node;
  }

  return node;
}
