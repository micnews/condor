var test = require('gap')

  , utils = require('./utils')

module.exports = function (server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('setup', function* (t) {
    yield [ browser.get(server.url), waitForEvent('load') ]
  })

  test('scroll', function* (t) {
    yield browser.safeEval('window.scrollTo(0, 300)')
    var event = yield waitForEvent('scroll')
    t.equal(event.scrollX, '0')
    t.equal(event.scrollY, '300')
  })

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}