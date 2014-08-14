var co = require('co')
  , test = require('tape')

  , server = require('./server')

  , browser = require('./co-wd')(
      require('wd').remote('http://localhost:9515')
    )

  , waitForEvent = function (desiredEventName) {
      return function (callback) {
        server.eventStream.on('data', function onEvent (data) {
          if (data.eventName === desiredEventName) {
            server.eventStream.removeListener('data', onEvent)
            callback(null, data)
          }
        })
      }
    }
  , port

test('setup server', function (t) {
  co(function* () {
    yield server.listen.bind(server, '0')
    port = server.address().port
    server.unref()
    t.end()
  })()
})

test('setup webdriver', function (t) {
  co(function* () {
    yield browser.init()
    yield browser.get('http://localhost:' + port)
    yield waitForEvent('load')
    t.end()
  })()
})

test('scroll', function (t) {
  co(function* () {
    yield browser.safeEval('window.scrollTo(0, 300)')
    var event = yield waitForEvent('scroll')
    t.equal(event.scrollX, '0')
    t.equal(event.scrollY, '300')
    t.end()
  })()
})

test('click on a link to a new page', function (t) {
  co(function* (){
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

    t.end()
  })()
})

test('shutdown', function (t) {
  co(function *() {
    yield browser.quit()
    t.end()
  })()
})
