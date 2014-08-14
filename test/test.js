var test = require('tape')
  , yiewd = require('yiewd')

  , server = require('./server')

  , browser = yiewd.remote('http://localhost:9515')

  , untilEvent = function (desiredEventName, callback) {
      server.eventStream.on('data', function onEvent (data) {
        if (data.eventName === desiredEventName) {
          server.eventStream.removeListener('data', onEvent)
          callback(null, data)
        }
      })
    }

test('setup server', function (t) {
  server.listen(0, t.end.bind(t))
  server.unref()
})

test('setup webdriver', function (t) {
  untilEvent('load', t.end.bind(t))

  browser.run(function *() {
    yield this.init()
    yield this.get('http://localhost:' + server.address().port)
  })
})

test('scroll', function (t) {
  untilEvent('scroll', function (err, event) {
    t.equal(event.scrollX, '0')
    t.equal(event.scrollY, '300')
    t.end()
  })

  browser.run(function *() {
    yield this.safeEval('window.scrollTo(0, 300)')
  })
})

test('shutdown', function (t) {
  browser.run(function *() {
    yield this.quit()
    t.end()
  })
})
