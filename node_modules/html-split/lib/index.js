var split = function (html, opts) {
  function removeScriptTags () {
    var nodetree = dal().html(html)
      , scriptNodes = nodetree.getElementsByTagName('script');
    while (scriptNodes.length) dal(scriptNodes[0]).detach();
    return nodetree;
  }

  var nodes = removeScriptTags().getElementsByTagName('*')
    , wrapper = dal().hide().move(0, 0).size(opts)
    , wrap = wrapper.clone().attach()
    , divs = [];

  for (var i = 0; i < nodes.length; i++) {
    if (wrap.full()) {
      divs.push(wrap.innerHTML);
      wrap = wrapper.clone().attach();
    }

    wrap.add(dal(nodes[i]).copy());
  }

  divs.push(wrap.innerHTML);
  return divs;
}
