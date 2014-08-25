var test = require('gap')

  , utils = require('./utils')

module.exports = function (server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('load', function* (t) {
    var events = yield {
            action: browser.get(server.url)
          , load: waitForEvent('load')
        }
      , event = events.load

    t.equal(event.scrollX, '0', 'scrollX is 0')
    t.equal(event.scrollY, '0', 'scrollY is 0')
    t.equal(event.location, server.url + '/', 'correct location')
    t.ok(utils.isNumber(event.windowWidth), 'windowWidth is a number')
    t.ok(utils.isNumber(event.windowHeight), 'windowHeight is a number')
    t.ok(utils.isNumber(event.duration), 'duration is a number')
    t.notOk(isNaN(new Date(event.timestamp)), 'timestamp is a valid date')
    t.ok(utils.isNumber(event.timezone), 'timezone is a number')

    ;[
        'referrer', 'path', 'clickX', 'clickY', 'href', 'target', 'visibility'
      , 'name', 'trackableType', 'trackableValue'
    ].forEach(function (key) {
      t.equal(event[key], '', key + ' is empty')
    })
  })

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}
