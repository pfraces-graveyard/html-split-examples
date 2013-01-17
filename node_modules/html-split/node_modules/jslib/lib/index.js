// # jsLib
//
// General purpose JavaScript Library

// # Constructor

// ## jslib(obj)
//
// Gets a JavaScript obj and returns an object with methods for dealing with
// that obj

var jslib = function (obj) {
  var self = {};
  self.obj = obj;

  // # Type detection and casts
  //
  // References:
  //
  // *   [http://blog.niftysnippets.org/2010/09/say-what.html](http://blog.niftysnippets.org/2010/09/say-what.html)
  // *   [https://developer.mozilla.org/en-US/docs/DOM/NodeList](https://developer.mozilla.org/en-US/docs/DOM/NodeList)

  // ## jslib.isString()
  //
  // Checks if the obj is a string

  self.isString = function () {
    return typeof self.obj === 'string' || self.obj instanceof String;
  }

  // ## jslib.isNumber()
  //
  // Checks if the obj is a number

  self.isNumber = function () {
    return typeof self.obj === 'number' || self.obj instanceof Number;
  }

  // ## jslib.isBoolean()
  //
  // Checks if the obj is a boolean

  self.isBoolean = function () {
    return typeof self.obj === 'boolean' || self.obj instanceof Boolean;
  }

  // ## jslib.isScalar()
  //
  // Checks if the obj is a scalar type (string, number or boolean)

  self.isScalar = function () {
    return self.isString() || self.isNumber() || self.isBoolean();
  }

  // ## jslib.isArray()
  //
  // Checks if the obj is an array

  self.isArray = function () {
    return self.obj instanceof Array;
  }

  // ## jslib.isFunction()
  //
  // Checks if the obj is a function

  self.isFunction = function () {
    return typeof self.obj === 'function';
  }

  // ## jslib.toArray()
  //
  // Returns the obj casted to a standard Array so you can use the Array
  // methods: forEach(), map(), filter(), ...

  self.toArray = function () {
    if (self.isArray()) return self.obj;
    if (self.isFunction()) return jslib(self.obj()).toArray();
    if (self.isScalar() || !self.obj.length) return [].concat(self.obj);
    return Array.prototype.map.call(self.obj, function (item) {
      return item;
    });
  }

  // # Working with Objects and Arrays

  // ## jslib.traverse(opts, handler)
  //
  // Traverses recursively through the child nodes in `obj`
  //
  // Based on: [http://github.com/substack/js-traverse](http://github.com/substack/js-traverse) 
  //
  // `opts`: _[Object]_
  //
  // *   `filter` **_(Optional)_ [String]_**
  //         Traverse only by this property
  //
  // *   `before` **_(Optional)_ [Function]**
  //         Called before any of the children are traversed
  //
  // *   `each` **_(Optional)_ [Function]**
  //         Called on each child
  //
  // *   `after` **_(Optional)_ [Function]**
  //         Called after any of the children are traversed

  self.traverse = function (opts) {
    var filtered = opts.filter ? self.obj[opts.filter] : self.obj;

    if (!filtered) return;
    if (opts.before) opts.before(self.obj);
    
    jslib(filtered).toArray().forEach(function (node) {
      if (opts.each) opts.each(node);
      jslib(node).traverse(opts);
    });

    if (opts.after) opts.after(self.obj);
  }

  return self;
}
