var fs = require('fs')

  , mime = require('mime')
  , paramify = require('paramify')
  , serveBrowserify = require('serve-browserify')({
        root: __dirname
      , debug: true
      , gzip: true
    })
  , count = 0
  , headers = [
        'eventName', 'windowWidth', 'windowHeight', 'scrollX', 'scrollY'
      , 'location' , 'duration', 'timestamp', 'timezone', 'referrer', 'path'
      , 'clickX', 'clickY', 'href', 'target', 'visibility', 'name'
      , 'trackableType', 'trackableValue'
    ].join(',')

    // serve the file, default to index.html
  , serveStatic = function (filename, res) {
      fs.readFile(__dirname + '/static/' + filename, function (err, file) {
        if (err) {
          serveStatic('index.html', res)
        } else {
          res.setHeader('content-type', mime.lookup(filename))
          res.end(file)
        }
      })
    }

  , createServer = function () {
      var server = require('http').createServer(function (req, res) {
          var match = paramify(req.url)

          if (req.method === 'POST') {
            req.on('data', function (chunk) {
              server.eventStream.write(chunk)
              server.eventStream.write(new Buffer('\n'))
            })
            req.once('end', res.end.bind(res))
          } else if (match('client.js')) {
            serveBrowserify(req, res)
          } else {
            serveStatic(req.url, res)
          }
        })

      server.eventStream = require('csv-parser')()
      server.eventStream.write(new Buffer(headers + '\n'))

      return server
    }

module.exports = createServer
