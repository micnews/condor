var test = require('gap')

  , utils = require('./utils')

  , server = utils.createServer()

  , browser = require('co-wd').remote('http://localhost:9515')

  , waitForEvent = utils.waitForEvent(server.eventStream)
  , port

test('setup', function* (t) {
  yield utils.setup(server, browser)
  port = server.address().port
  yield [ browser.get('http://localhost:' + port), waitForEvent('load') ]
})

test('scroll', function* (t) {
  yield browser.safeEval('window.scrollTo(0, 300)')
  var event = yield waitForEvent('scroll')
  t.equal(event.scrollX, '0')
  t.equal(event.scrollY, '300')
})

test('shutdown', function* (t) {
  yield utils.shutdown(server, browser)
})
