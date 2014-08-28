// this file must be run in gnode or similar, to have generators support

var utils = require('./utils')
  , gap = require('gap')
  , tape = require('tape')
  , server = utils.createServer()
  , read = require('co-read')
  , co = require('co')
    // TODO: use phantomjs for this somehow
  , browser = require('co-wd').remote('http://localhost:9515')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])

co(function* () {
  yield server.listen.bind(server, 0)
  yield browser.init()
  server.url = 'http://localhost:' + server.address().port

    var result = []
    , harness = tape.createHarness()
    , stream = harness.createStream()
    , test = gap.inject(harness)
    , buf

  Object.keys(tests).forEach(function (key) {
    tests[key](test, server, browser)
  })

  while(buf = yield read(stream)) {
    result.push(buf)
  }

  console.log(result.join(''))

  yield browser.quit()
  yield server.close.bind(server)
})()
