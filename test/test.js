var co = require('co')
  , test = require('tape')

  , server = require('./server')

  , browser = require('./co-wd')(
      require('wd').remote('http://localhost:9515')
    )

  , untilEvent = function (desiredEventName) {
      return function (callback) {
        server.eventStream.on('data', function onEvent (data) {
          if (data.eventName === desiredEventName) {
            server.eventStream.removeListener('data', onEvent)
            callback(null, data)
          }
        })
      }
    }

test('setup server', function (t) {
  co(function* () {
    yield server.listen.bind(server, '0')
    server.unref()
    t.end()
  })()
})

test('setup webdriver', function (t) {
  co(function* () {
    yield browser.init()
    yield browser.get('http://localhost:' + server.address().port)
    yield untilEvent('load')
    t.end()
  })()
})

test('scroll', function (t) {
  co(function* () {
    yield browser.safeEval('window.scrollTo(0, 300)')
    var event = yield untilEvent('scroll')
    t.equal(event.scrollX, '0')
    t.equal(event.scrollY, '300')
    t.end()
  })()
})

test('shutdown', function (t) {
  co(function *() {
    yield browser.quit()
    t.end()
  })()
})
