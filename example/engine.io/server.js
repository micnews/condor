var paramify = require('paramify')
  , serveBrowserify = require('serve-browserify')({
        root: __dirname
      , debug: true
      , gzip: true
    })
  , count = 0

  , httpServer = require('http').createServer(function (req, res) {
      var match = paramify(req.url)

      if (req.method === 'POST') {
        req.on('data', function (row) {
          console.log(row.toString(), row.length, ++count)
        })
        req.once('end', res.end.bind(res))
      } else if (match('client.js')) {
        serveBrowserify(req, res)
      } else {
        require('fs').readFile(__dirname + '/index.html', function (err, html) {
          res.writeHeader({ 'content-type': 'text/html' })
          res.end(html)
        })
      }
    })
  , engineServer = require('engine.io').attach(httpServer)

engineServer.on('connection', function (socket) {
  socket.on('message', function (row) {
    console.log(row, row.length, ++count)
  })
})

httpServer.listen(1235, function () {
  console.log('example page loaded on port 1235')
})