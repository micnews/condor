// this file must be run in gnode or similar, to have generators support

var test = require('gap')
  , localtunnel = require('localtunnel')
  , path = require('path')

  , utils = require('./utils')
  , build = (new Date()).toJSON()
  , spawn = require('child_process').spawn

require('co')(function* () {
  var browsers = yield require('./utils/saucelabs')

  for(var i = 0; i < browsers.length; ++i) {
    var child = spawn(
        path.resolve(__dirname, '../node_modules/.bin/gnode')
      , [
            __dirname + '/saucelabs-child.js'
          , JSON.stringify(browsers[i])
          , build
        ]
    )
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    yield child.once.bind(child, 'exit')
  }
})()
