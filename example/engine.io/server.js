var paramify = require('paramify')
  , serveBrowserify = require('serve-browserify')({
        root: __dirname
      , debug: true
      , gzip: true
    })
  , count = 0

  , printCsv = function (csvLine) {
      console.log(
          'size: %sbytes\tcount: %s\tcsv: %s'
        , csvLine.length, ++count, csvLine.toString()
      )
    }

  , httpServer = require('http').createServer(function (req, res) {
      var match = paramify(req.url)

      if (req.method === 'POST') {
        req.on('data', function (row) {
          printCsv(row)
        })
        req.once('end', res.end.bind(res))
      } else if (match('client.js')) {
        serveBrowserify(req, res)
      } else {
        require('fs').readFile(__dirname + '/index.html', function (err, html) {
          res.writeHead(200, { 'content-type': 'text/html' })
          res.end(html)
        })
      }
    })
  , engineServer = require('engine.io').attach(httpServer)

engineServer.on('connection', function (socket) {
  socket.on('message', function (row) {
    printCsv(row)
  })
})

httpServer.listen(1235, function () {
  console.log('example page loaded on port 1235')
})
