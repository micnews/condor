var paramify = require('paramify')
  , serveBrowserify = require('serve-browserify')({
        root: __dirname
      , debug: true
      , gzip: true
    })
  , count = 0
  , headers = [
        'eventName', 'windowWidth', 'windowHeight', 'scrollX', 'scrollY', 'location'
      , 'offset', 'referrer', 'path', 'clickX', 'clickY', 'href', 'target'
      , 'visibility', 'name', 'trackableType', 'trackableValue'
    ].join(',')

  , server = require('http').createServer(function (req, res) {
      var match = paramify(req.url)

      if (req.method === 'POST') {
        req.on('data', function (chunk) {
          server.eventStream.write(chunk)
          server.eventStream.write(new Buffer('\n'))
        })
        req.once('end', res.end.bind(res))
      } if (match('client.js'))
        serveBrowserify(req, res)

      else
        require('fs').readFile(__dirname + '/index.html', function (err, html) {
          res.writeHeader({ 'content-type': 'text/html' })
          res.end(html)
        })

    })

server.eventStream = require('csv-parser')()
server.eventStream.write(new Buffer(headers + '\n'))

module.exports = server
