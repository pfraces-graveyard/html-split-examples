// # split(html, opts)
//
// Splits an html in several portions each of which can be contained in a
// box with specific dimensions
//
// `html`: _[String]_ A valid html string with the content to be spliited
// `opts`: _[Object]_
//
// *   `opts.size`: _[Object]_
//
//     *   `opts.size.width`: Width of the container
//     *   `opts.size.height`: Height of the container

var split = function (html, opts) {
  var nodes = modal(html)
    , wrapper = dal().hide().size(opts.size)
  
    // ## wrap
    //
    // Actuará de div contenedor temporal. Tendrá el tamaño indicado en
    // `opts.size`

    , wrap = wrapper.clone().attach()
    , divs = [];

  // ## Recorrer los nodos del `html`
  //
  // Por cada nodo debemos:
  //
  // 1.  agregar el nodo a `wrap`
  // 2.  si `wrap.isFull()`
  //
  //     1.  eliminar el último nodo añadido `sobrante`
  //     2.  Apilar `wrap`
  //     3.  `wrap = wrapper.clone();`
  //     4.  `wrap.add(sobrante);`
  //
  // En 1.4 perdemos anidamiento, así que debemos corregirlo añadiendo también
  // los padres del nodo que se está intentando añadir.
  //
  // **1.4:** `wrap.add(node.pathTo(sobrante));`
  //
  // Para agregar un elemento al `wrap`, debemos saber bajo que nodo lo hemos
  // de añadir, por tanto la idea de `pathLeaf` de la opción descartada puede
  // servir, renombrada a `parent`

  nodes.forEach(function (node) {


    // ## parent
    //
    // Referencia al padre del nodo actual
    // 
    // [TODO] Implementar en `traverse`

    var parent = wrap;

    node.traverse({
      before: function (el) {
        var copy = el.copy();

        parent.add(copy);

        if (wrap.isFull()) {

          // Guarda los ancestros del nodo que sobresale, para añadirlos
          // posteriormente al contenedor nuevo
          path = copy.path(wrap.last());

          // Elimina el elemento que sobresale del contenedor lleno
          copy.detach();

          // Agrega el contenido html del contenedor lleno al array `divs`
          divs.push(wrap.getHtml());

          // Crea un nuevo contenedor
          wrap.detach();
          wrap = wrapper.clone().attach();

          // Añade los ancestros guardados al nuevo contenedor
          wrap.add(path);

          // Coloca el puntero del padre del elemento actual sobre el último de
          // los ancestros
          parent = path.lastLeaf();
        }
        else parent = copy;
      }
      , after: function () {
        parent = parent.parent();
      }
    });
  });

  divs.push(wrap.getHtml());
  wrap.detach();
  return divs;
}
