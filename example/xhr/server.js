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

require('http').createServer(function (req, res) {
  var match = paramify(req.url)

  if (req.method === 'POST') {
    req.on('data', function (chunk) {
      console.log('Got a batch of data, size: %s', chunk.length)
      chunk.toString().split('\n').forEach(function (row) {
        printCsv(row)
      })
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

}).listen(1234, function () {
  console.log('example page loaded on port 1234')
})