var test = require('gap')

  , utils = require('./utils')

module.exports = function (server, browser) {
  var waitForEvent = utils.waitForEvent(server.eventStream)

  test('trackable-load, trackable-visible on load', function* (t) {
    var events = yield {
            action: browser.get(server.url + '/trackable.html')
          , load: function* () {
              var loadEvents = {}
              for(var i = 0; i < 2; ++i) {
                var event = yield waitForEvent('trackable-load')
                loadEvents[event.trackableValue] = event
              }
              return loadEvents
            }
          , visible: waitForEvent('trackable-visible')
        }
      , aboveTheFoldLoad = events.load['above-the-fold']
      , belowTheFoldLoad = events.load['below-the-fold']
      , aboveTheFoldVisible = events.visible

    t.equal(aboveTheFoldLoad.path, 'span#above-the-fold')
    t.equal(aboveTheFoldLoad.trackableType, 'type')
    t.equal(aboveTheFoldLoad.trackableValue, 'above-the-fold')
    t.equal(belowTheFoldLoad.path, 'span#below-the-fold')
    t.equal(belowTheFoldLoad.trackableType, 'type')
    t.equal(belowTheFoldLoad.trackableValue, 'below-the-fold')
    t.equal(aboveTheFoldVisible.path, 'span#above-the-fold')
    t.equal(aboveTheFoldVisible.trackableType, 'type')
    t.equal(aboveTheFoldVisible.trackableValue, 'above-the-fold')
  })

  test('trackable-visible on scroll', function* (t) {
    var element = yield browser.elementByCssSelector('#below-the-fold')
      , location = yield browser.getLocation(element)
      , events = yield {
            visible: waitForEvent('trackable-visible')
          , action: browser.safeEval('window.scrollTo(0, ' + (location.y + 1) +  ')')
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

  test('teardown', function* (t) {
    yield browser.get('about:blank')
  })
}
