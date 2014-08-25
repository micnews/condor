// this file must be run in gnode or similar, to have generators support

var test = require('gap')
  , localtunnel = require('localtunnel')

  , utils = require('./utils')
  , server = utils.createServer()
    // TODO: use phantomjs for this somehow
  , browser = require('co-wd').remote('http://localhost:9515')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])
  , tunnel

test('init', function* (t) {
  yield utils.setup(server, browser)
  tunnel = yield localtunnel.bind(localtunnel, server.address().port)
  server.url = tunnel.url
})

Object.keys(tests).forEach(function (key) {
  tests[key](server, browser)
})

test('teardown', function* (t) {
  tunnel.close()
  yield utils.shutdown(server, browser)
})
