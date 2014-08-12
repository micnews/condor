var paramify = require('paramify')
  , serveBrowserify = require('serve-browserify')({
        root: __dirname
      , debug: true
      , gzip: true
    })
  , count = 0

require('http').createServer(function (req, res) {
  var match = paramify(req.url)

  if (req.method === 'POST') {
    req.on('data', function (chunk) {
      console.log(chunk.toString(), chunk.length, ++count)
    })
    req.once('end', res.end.bind(res))
  } if (match('client.js'))
    serveBrowserify(req, res)

  else
    require('fs').readFile(__dirname + '/index.html', function (err, html) {
      res.writeHeader({ 'content-type': 'text/html' })
      res.end(html)
    })

}).listen(1234, function () {
  console.log('example page loaded on port 1234')
})