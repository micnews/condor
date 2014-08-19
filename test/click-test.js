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
  t.equal(events.load.referrer, 'http://localhost:' + port + '/', 'loadEvent: referrer is correct')
  t.equal(events.load.location, 'http://localhost:' + port + '/beep-boop', 'loadEvent: location is correct')
  t.equal()
})

test('shutdown', function* (t) {
  yield utils.shutdown(server, browser)
})
