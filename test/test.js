var test = require('gap')

  , utils = require('./utils')

  , server = utils.createServer()

  , browser = require('co-wd').remote('http://localhost:9515')

  , waitForEvent = utils.waitForEvent(server.eventStream)
  , port

test('setup', function* (t) {
  yield utils.setup(server, browser)
  port = server.address().port
})

test('load', function* (t) {
  yield browser.get('http://localhost:' + port)
  var event = yield waitForEvent('load')

  t.equal(event.scrollX, '0', 'scrollX is 0')
  t.equal(event.scrollY, '0', 'scrollY is 0')
  t.equal(event.location, 'http://localhost:' + port + '/', 'correct location')
  t.ok(/^[0-9]+$/.test(event.windowWidth), 'windowWidth is a number')
  t.ok(/^[0-9]+$/.test(event.windowHeight), 'windowHeight is a number')
  t.ok(/^[0-9]+$/.test(event.offset), 'offset is a number')

  ;[
      'referrer', 'path', 'clickX', 'clickY', 'href', 'target', 'visibility'
    , 'name', 'trackableType', 'trackableValue'
  ].forEach(function (key) {
    t.equal(event[key], '', key + ' is empty')
  })
})

test('scroll', function* (t) {
  yield browser.safeEval('window.scrollTo(0, 300)')
  var event = yield waitForEvent('scroll')
  t.equal(event.scrollX, '0')
  t.equal(event.scrollY, '300')
})

test('click on a link to a new page', function* (t) {
  var link = yield browser.elementByCssSelector('#beep-boop')
    , events = yield {
          click: waitForEvent('click')
        , end: waitForEvent('end')
        , load: waitForEvent('load')
        , action: browser.clickElement(link)
      }

  t.ok(events.click.offset <= events.end.offset, 'click event occurs before end')
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
