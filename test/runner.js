// this file must be run in gnode or similar, to have generators support

var test = require('gap')
  , utils = require('./utils')
  , server = utils.createServer()
    // TODO: use phantomjs for this somehow
  , browser = require('co-wd').remote('http://localhost:9515')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])

test('init', function* (t) {
  yield utils.setup(server, browser)
  server.url = 'http://localhost:' + server.address().port
})

Object.keys(tests).forEach(function (key) {
  tests[key](server, browser)
})

test('teardown', function* (t) {
  yield utils.shutdown(server, browser)
})
