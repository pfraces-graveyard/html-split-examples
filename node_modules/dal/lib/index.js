// # DAL - DOM Abstraction Layer
//
// **DAL** gets a DOM element and returns an object with methods for dealing
// with that element

// # Constructor
//
// ## dal(el)
//
// Gets a DOM element and returns an object with methods for dealing with that
// element
//
// `el` _(Optional)_: If no element is passed, a `div` element will be created
// and used, but also detached from the `document.body` (so is invisible) by
// default
//
// *   _[String]_ id of the DOM element
// *   _[Object: DOM Element]_ 

var dal = function (el) {
  var self = {};
  if (!el) self.DOM = document.createElement('div');
  else if (jslib(el).isString()) self.DOM = document.getElementById(el);
  else self.DOM = el; 

  // Save some original settings
  
  if (self.DOM.style) {
    self.orig = {
      display:    self.DOM.style.display
      , overflow:   self.DOM.style.overflow
      , position:   self.DOM.style.position
    }
  }
  else self.orig = {};

  // # Getters

  // ## dal.getHtml()
  //
  // Returns the innerHTML value from `el`

  self.getHtml = function () {
    return self.DOM.innerHTML;
  }

  // ## dal.toHtml()
  //
  // Returns the HTML representation of `el`

  self.toHtml = function () {
    return dal().add(self).DOM.innerHTML;
  }

  // ## dal.getChildren()
  //
  // Returns an array of the childNodes of `el` as `dal` elements

  self.getChildren = function () {
    return jslib(self.DOM.childNodes)
      .toArray()
      .map(function (el) {
        return dal(el);
      });
  }

  // ## dal.getColor()
  //
  // Returns an object
  // 
  //     {
  //       bg: `el` background color,
  //       fg: `el` foreground color
  //     }

  self.getColor = function () {
    return {
      bg: self.DOM.style.background
      , fg: self.DOM.style.color
    };
  }

  // # Boolean methods
  //
  // This methods checks for something in the DOM element `el` received with
  // the constructor

  // ## dal.isSame(target)
  //
  // Determines if `target` and `el` are the same DOM element
  //
  // `target`
  //
  // *   _[Object: DOM Element]_
  // *   _[Object: DAL instance]_

  self.isSame = function (target) {
    if (target.DOM) target = target.DOM;
    return self.DOM === target;
  }

  // ## dal.isUnder(target)
  //
  // Determines whether `el` is descendant of `target
  //
  // `target`
  //
  // *   _[Object: DOM Element]_
  // *   _[Object: DAL instance]_

  self.isUnder = function (target) {
    var parent = self.DOM.parentNode;
    if (target.DOM) target = target.DOM;
    while (parent) {
      if (parent === target) return true;
      parent = parent.parentNode;
    }
    return false;
  }

  // ## dal.isFull()
  //
  // Determines whether `el` is overflowing its bounds

  self.isFull = function () {
    self.DOM.style.overflow = 'hidden';
    var isOverflowing = (self.DOM.clientWidth + 1) < self.DOM.scrollWidth ||
                        (self.DOM.clientHeight + 1) < self.DOM.scrollHeight;
    self.DOM.style.overflow = self.orig.overflow;
    return isOverflowing;
  }

  // ## dal.isEmpty()
  //
  // Determines whether `el` has any child

  self.isEmpty = function () {
    return !self.DOM.firstChild;
  }

  // ## dal.isTag(tagName)
  // 
  // Determines whether `el` is a tag and (if passed) its a `tagName` tag
  //
  // `tagName` _(Optional)_: _[String]_

  self.isTag = function (tagName) {
    if (self.DOM.tagName) {
      return self.DOM.tagName === tagName.toUpperCase();
    }
    return false;
  }

  // ## dal.hasClass(className)
  //
  // Determines whether `className` is a class of `el`
  //
  // `className`: _[String]_

  self.hasClass = function (className) {
    return self.DOM.classList ? self.DOM.classList.contains(className) : false;
  }

  // # Chainable API
  //
  // The rest is a collection of methods for managing the DOM element `el`
  // received with the constructor
  //
  // Every one of them is chainable

  // # Element management methods

  // ## dal.attach()
  //
  // Attaches `el` to the `document.body` if it was not attached yet

  self.attach = function () {
    if (!self.isUnder(document.body)) document.body.appendChild(self.DOM);
    return self;
  }

  // ## dal.detach()
  //
  // Detaches `el` from his parent if it has one

  self.detach = function () {
    if (self.DOM.parentNode) self.DOM.parentNode.removeChild(self.DOM);
    return self;
  }

  // ## dal.add(newEl, content)
  //
  // Attaches a new element to `el`
  //
  // `newEl`:
  //
  // *   _[Object: DAL instance]_ 
  // *   _[Object: DOM Element]_
  //
  // *   _[String]_ An element is created and attached
  //
  //         self().add('h1', 'Hello world!')
  //
  // `content` _(Optional)_: _[String]_ Default content for the new element

  self.add = function (newEl, content) {
    var el = {};
    if (jslib(newEl).isString()) el = document.createElement(newEl);
    else if (newEl.DOM) el = newEl.DOM;
    else el = newEl;
    if (content) el.appendChild(document.createTextNode(content));
    self.DOM.appendChild(el);
    return self;
  }

  // ## dal.clear()
  //
  // Removes all the children of `el`

  self.clear = function () {
    while (!self.isEmpty()) self.DOM.removeChild(self.DOM.firstChild);
    return self;
  }

  // ## dal.copy()
  //
  // Returns a copy of itself excluding its children nodes

  self.copy = function () {
    return dal(self.DOM.cloneNode(false));
  }

  // ## dal.clone()
  //
  // Returns a clone of itself including its children nodes

  self.clone = function () {
    return dal(self.DOM.cloneNode(true));
  }

  // ## dal.parent()
  //
  // Returns the parent of `el`

  self.parent = function () {
    return dal(self.DOM.parentNode);
  }

  // ## dal.first()
  //
  // Returns the first child of `el`

  self.first = function () {
    return dal(self.DOM.firstChild);
  }

  // ## dal.last()
  //
  // Returns the last child of `el`

  self.last = function () {
    return dal(self.DOM.lastChild);
  }

  // ## dal.lastLeaf()
  //
  // Returns the last leaf element `el` traversing through its `lastChild`s

  self.lastLeaf = function () {
    var lastChild = self.DOM.lastChild;
    if (!lastChild) return self;

    while(lastChild) {
      if (!lastChild.lastChild) return dal(lastChild);
      lastChild = lastChild.lastChild
    }
  }

  // ## dal.traverse(opts)
  //  
  // Traverses recursively through the elements in `el`
  //
  // `opts`: _[Object]_
  //
  // *   `before (el)` **_(Optional)_ [Function]**
  //         Called before any of the children are traversed
  //
  // *   `each (el)` **_(Optional)_ [Function]**
  //         Called on each child
  //
  // *   `after (el)` **_(Optional)_ [Function]**
  //         Called after any of the children are traversed
  //
  // The node received by `before`, `each` and `after` is a dal object pointing
  // to the current DOM element in the recursion

  self.traverse = function (opts) {
    jslib(self.DOM).traverse({
      filter: 'childNodes'
      , before: !opts.before ? opts.before : function (node) {
          opts.before(dal(node));
        }
      , each: !opts.each ? opts.each : function (node) {
          opts.each(dal(node));
        }
      , after: !opts.after ? opts.after : function (node) {
          opts.after(dal(node));
        }
    });
  }

  // ## dal.path(target)
  //
  // Returns a new `dal` object containing a tree composed with shallow copies
  // from `target` to `el` 
  //
  // If `el` is not under `target`, returns `undefined`
  // If `el` and `target` are the same returns a shallow copy of `el`

  self.path = function (target) {
    var path = self.copy()
      , parent = self.DOM.parentNode;
    if (target.DOM) target = target.DOM;
    if (self.isSame(target)) return self.copy();
    while (parent) {
      path = dal(parent).copy().add(path);
      if (parent === target) return path;
      parent = parent.parentNode;
    }
  }

  // # CSS layout methods

  // ## dal.show()
  //
  // Makes `el` visible (is if is attached to the `document.body`)

  self.show = function () {
    self.DOM.style.position = self.orig.position;
    self.DOM.style.visibility = 'visible';
    return self;
  }

  // ## dal.hide()
  //
  // Makes `el` invisible and ignored by the layout, but behaving as when
  // visible

  self.hide = function () {
    self.DOM.style.position = 'absolute';
    self.DOM.style.visibility = 'hidden';
    return self;
  }

  // ## dal.clean()
  //
  // Makes `el` invisible but respected by the layout

  self.clean = function () {
    self.DOM.style.visibility = 'hidden';
    return self;
  }

  // ## dal.move(opts)
  //
  // Makes the element absotule positioned at `(opts.x, opts.y)`

  self.move = function (opts) {
    self.DOM.style.position = 'absolute';
    self.DOM.style.left = opts.x; 
    self.DOM.style.top = opts.y;
    return self;
  }

  // # CSS style methods

  // ## dal.color(opts)
  //
  // Changes the background and text color of `el`
  //
  // `opts`: _[Object]_
  //
  // *   `opts.bg`: Determines the backgroud color
  // *   `opts.fg`: Determines the text color
  // *   `opts.opacity`: Determines the opacity

  self.color = function (opts) {
    if (opts.bg) self.DOM.style.background = opts.bg;
    if (opts.fg) self.DOM.style.color = opts.fg;
    if (opts.opacity) self.DOM.style.opacity = opts.opacity;
    return self;
  }

  // ## dal.size(opts)
  //
  // Changes the size of `el`
  //
  // `opts`: _[Object]_
  //
  // *   `opts.width`: Determines the width of the element
  // *   `opts.height`: Determines the height of the element

  self.size = function (opts) {
    self.DOM.style.width = opts.width;
    self.DOM.style.height = opts.height;
    return self;
  }

  // ## dal.collapse()
  //
  // Collapses `el` data

  self.collapse  = function () {
    self.DOM.style.border = '';
    self.DOM.style.margin = '';
    self.DOM.style.padding = '';
    return self;
  }

  // ## dal.uncollapse()
  //
  // Uncollapses `el` data

  self.uncollapse = function () {
    var padding = self.DOM.style.padding;
    if (!padding || padding === '0') self.DOM.style.padding = '1px';
    return self;
  }

  // # Tag attribute methods

  self.class = {

    // ## dal.class.add(className)
    //
    // Adds `class` as a CSS class of `el`
    //
    // `className`: _[String]_ A CSS class to be added

    add: function (className) {
      self.DOM.className += ' ' + className;
      return self;
    }

    // ## dal.class.del(className)
    //
    // Deletes `class` from the CSS classes of `el`
    //
    // `className`: _[String]_ The CSS class to be deleted

    , del: function (className) {
      self.DOM.className = self.DOM.className
        .replace(new RegExp('\\b' + className + '\\b'));
    }
  }

  // # Misc property methods
  //
  // Chaining useful property definitions

  // ## self.html(html)
  //
  // Sets the `innerHTML` value of the element

  self.html = function (html) {
    self.DOM.innerHTML = html;
    return self;
  }

  return self;
}
