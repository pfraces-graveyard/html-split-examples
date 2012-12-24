run = function () {
  var size = { width: '20em', height: '10em' }
    , tokens = split(dal('content').innerHTML, size)
    , original = dal().color({ bg: 'red', fg: 'white' }).size(size);

  for (var i = 0; i < tokens.length; i++) {
    dal('split')
      .add( original.clone()
              .html(tokens[tokens.length - 1 - i])
              .class.add('token'));
  }
}
