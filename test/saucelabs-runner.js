// this file must be run in gnode or similar, to have generators support

var test = require('gap')
  , localtunnel = require('localtunnel')
  , getBrowsers = require('get-saucelabs-browsers')
  , path = require('path')

  , utils = require('./utils')
  , build = process.env.TRAVIS_BUILD_NUMBER || (new Date()).toJSON()
  , spawn = require('child_process').spawn
  , browsersToTest = require('../package.json').browsers

require('co')(function* () {
  var browsers = yield getBrowsers.bind(null, browsersToTest)

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
