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

test('trackable-load, trackable-visible on load', function* (t) {
  yield browser.get('http://localhost:' + port + '/trackable.html')
  var events = {
          aboveTheFold: yield waitForEvent('trackable-load')
        , belowTheFold: yield waitForEvent('trackable-load')
        , aboveTheFoldVisible: yield waitForEvent('trackable-visible')
      }

  t.equal(events.aboveTheFold.path, 'span#above-the-fold')
  t.equal(events.aboveTheFold.trackableType, 'type')
  t.equal(events.aboveTheFold.trackableValue, 'above-the-fold')
  t.equal(events.belowTheFold.path, 'span#below-the-fold')
  t.equal(events.belowTheFold.trackableType, 'type')
  t.equal(events.belowTheFold.trackableValue, 'below-the-fold')
  t.equal(events.aboveTheFoldVisible.path, 'span#above-the-fold')
  t.equal(events.aboveTheFoldVisible.trackableType, 'type')
  t.equal(events.aboveTheFoldVisible.trackableValue, 'above-the-fold')
})

test('trackable-visible on scroll', function* (t) {
  var element = yield browser.elementByCssSelector('#below-the-fold')
    , events = yield {
          visible: waitForEvent('trackable-visible')
        , action: browser.moveTo(element)
      }

  t.equal(events.visible.path, 'span#below-the-fold')
  t.equal(events.visible.trackableType, 'type')
  t.equal(events.visible.trackableValue, 'below-the-fold')
})

test('trackable-click on subelement', function* (t) {
  var element = yield browser.elementByCssSelector('#below-the-fold a')
    , events = yield {
          trackable: waitForEvent('trackable-click')
        , link: waitForEvent('click')
        , action: browser.clickElement(element)
      }

  t.equal(events.link.path, 'span#below-the-fold > a:nth-child(1)')
  t.equal(events.trackable.path, 'span#below-the-fold')
  t.equal(events.trackable.trackableType, 'type')
  t.equal(events.trackable.trackableValue, 'below-the-fold')
})

test('trackable-click on none-link', function* (t) {
  var element = yield browser.elementByCssSelector('#above-the-fold')
    , events = yield {
          trackable: waitForEvent('trackable-click')
        , action: browser.clickElement(element)
      }
  t.equal(events.trackable.path, 'span#above-the-fold')
  t.equal(events.trackable.trackableType, 'type')
  t.equal(events.trackable.trackableValue, 'above-the-fold')
})

test('shutdown', function* (t) {
  yield utils.shutdown(server, browser)
})
