var co = require('co')
  , test = require('tape')
  , yiewd = require('yiewd')

  , server = require('./server')

  , browser = yiewd.remote('http://localhost:9515')

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
  server.listen(0, t.end.bind(t))
  server.unref()
})

test('setup webdriver', function (t) {
  browser.run(function *() {
    yield this.init()
    yield this.get('http://localhost:' + server.address().port)

    co(function *() {
      yield untilEvent('load')
      t.end()
    })()
  })
})

test('scroll', function (t) {
  browser.run(function *() {
    yield this.safeEval('window.scrollTo(0, 300)')

    co(function *() {
      var event = yield untilEvent('scroll')
      t.equal(event.scrollX, '0')
      t.equal(event.scrollY, '300')
      t.end()
    })()
  })
})

test('shutdown', function (t) {
  browser.run(function *() {
    yield this.quit()
    t.end()
  })
})
