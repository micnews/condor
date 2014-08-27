var test = require('gap')

  , utils = require('./utils')

module.exports = function (server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('setup', function* (t) {
    yield [ browser.get(server.url), waitForEvent('load') ]
  })

  test('click on a link to a new page', function* (t) {
    var link = yield browser.elementByCssSelector('#beep-boop')
      , events = yield {
            click: waitForEvent('click')
          , end: waitForEvent('end')
          , load: waitForEvent('load')
          , action: browser.clickElement(link)
        }

    t.ok(events.click.duration <= events.end.duration, 'click event occurs before end')
    t.notEqual(events.click.clickX, '', 'clickEvent: clickX is set')
    t.notEqual(events.click.clickY, '', 'clickEvent: clickY is set')
    t.equal(events.click.href, '/beep-boop', 'clickEvent: href is correct')
    t.equal(events.click.path, 'a#beep-boop', 'clickEvent: path is correct')
    t.equal(events.load.referrer, server.url + '/', 'loadEvent: referrer is correct')
    t.equal(events.load.location, server.url + '/beep-boop', 'loadEvent: location is correct')
    t.equal()
  })

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}
