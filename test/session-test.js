var utils = require('./utils')

module.exports = function (test, server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('setup', function* (t) {
    yield [ browser.get(server.url), waitForEvent('load') ]
  })

  test('session and visitor', function* (t) {
    var link = yield browser.elementByCssSelector('#beep-boop')
      , events = yield {
            click: waitForEvent('click')
          , end: waitForEvent('end')
          , load: waitForEvent('load')
          , action: browser.clickElement(link)
        }

    t.notEqual(events.click.visitor, '', 'visitor is set')
    t.notEqual(events.click.session, '', 'session is set')
    t.equal(events.click.visitor, events.end.visitor, 'visitor is the same')
    t.equal(events.click.session, events.end.session, 'session is the same')
    t.equal()
  })

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}
