var utils = require('./utils')

module.exports = function (test, server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('setup', function* (t) {
    yield [ browser.get(server.url), waitForEvent('load') ]
  })

  test('scroll', function* (t) {
    var events = yield {
            scroll: waitForEvent('scroll')
          , action: browser.safeEval('window.scrollTo(0, 300)')
        }
      , scrollEvent = events.scroll
    t.equal(scrollEvent.scrollX, '0')
    t.equal(scrollEvent.scrollY, '300')
  })

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}