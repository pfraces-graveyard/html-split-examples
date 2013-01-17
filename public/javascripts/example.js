run = function () {
  var size = { width: '20em', height: '10em' }
    , tokens = split(dal('content').getHtml(), { size: size })
    , original = dal()
        .size(size)
        .class.add('token')
        .uncollapse();

  for (var i = 0; i < tokens.length; i++) {
    dal('split')
      .add(
        original
          .clone()
          .html(tokens[tokens.length - 1 - i])
      );
  }
}
