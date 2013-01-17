// # modal - DOM selector
//
// `modal.nodes` is an array of filters and each filter is an array of DAL
// elements

var modal = function (selector) {
  var K_SELECTOR_NULL     = 0
    , K_SELECTOR_ELEMENT  = 1
    , K_SELECTOR_ID       = 2
    , K_SELECTOR_CLASS    = 3
    , K_SELECTOR_TAG      = 4
    , K_SELECTOR_HTML     = 5

  function selectorType(selector) {
    if (!selector) return K_SELECTOR_NULL;
    if (jslib(selector).isString()) {
      if (/^[#][\w]+$]/.test(selector)) return K_SELECTOR_ID;
      if (/^[.][\w]+$/.test(selector)) return K_SELECTOR_CLASS;
      if (/^[\w]+$/.test(selector)) return K_SELECTOR_TAG;
      return K_SELECTOR_HTML;
    }
    return K_SELECTOR_ELEMENT;
  }

  function getNodes () {
    var selType = selectorType(selector)
      , arr;

    if (selType === K_SELECTOR_ID || selType === K_SELECTOR_CLASS) {
      selector = selector.slice(1);
    }
    switch (selType) {
      case K_SELECTOR_NULL:
        arr = [].concat(dal());
        break;
      case K_SELECTOR_ELEMENT:
      case K_SELECTOR_ID:
        arr = [].concat(dal(selector));
        break;
      case K_SELECTOR_CLASS:
        arr = document.getElementsByClassName(selector);
        if (arr.length) {
          arr = Array.prototype.map.call(arr, function (el) {
            return dal(el);
          });
        }
        else arr = [].concat(dal());
        break;
      case K_SELECTOR_TAG:
        arr = document.getElementsByTagName(selector);
        if (arr.length) {
          arr = Array.prototype.map.call(arr, function (el) {
            return dal(el);
          });
        }
        else arr = [].concat(dal());
        break;
      case K_SELECTOR_HTML:
        arr = dal().html(selector).getChildren();
        break;
    }
    return arr;
  }

  var self = {};
  self.nodes = [];

  self.nodes.push(getNodes());

  self.filter = function (selector) {
    switch (selectorType(selector)) {
      case K_SELECTOR_CLASS:
        self.nodes.push(self.nodes[self.nodes.length - 1].filter(
          function (el) {
            return el.hasClass(selector);
          }
        ));
        break;
      case K_SELECTOR_TAG:
        self.nodes.push(self.nodes[self.nodes.length - 1].filter(
          function (el) {
            return el.isTag(selector);
          }
        ));
        break;
    }
    return self;
  }

  self.forEach = function (callback) {
    self.nodes[self.nodes.length - 1].forEach(callback);
    return self;
  }

  self.del = function () {
    self.forEach(function (el) {
      el.detach();
    });
    self.nodes.pop();
    return self;
  }

  return self;
}
