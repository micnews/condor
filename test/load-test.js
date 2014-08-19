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

test('shutdown', function* (t) {
  yield utils.shutdown(server, browser)
})
