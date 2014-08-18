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

test('shutdown', function* (t) {
  yield utils.shutdown(server, browser)
})
