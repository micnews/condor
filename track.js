var addEventListener = require('add-event-listener')
  , debounce = require('debounce')
  , getCssPath = require('css-path')
  , toCsv = require('csv-line')({ escapeNewlines: true })

module.exports = function (callback) {
  var windowWidth = window.innerWidth
    , windowHeight = window.innerHeight

    , startTime = Date.now()

    , scrollingOffset = 0
    , resizingOffset = 0
    , track = function (eventType, extra, offset, done) {
        if (typeof(offset) === 'function') {
          done = offset
          offset = Date.now() - startTime
        }

        done = done || function () {}
        extra = extra || []
        offset = typeof(offset) === 'number' ? offset : Date.now() - startTime

        var array = [
                eventType
              , window.innerWidth
              , window.innerHeight
              , window.scrollX
              , window.scrollY
              , window.location.toString()
              , offset
              , navigator.userAgent
              , document.referrer
            ]
            .concat(extra)

        callback(toCsv(array), done)
      }
    , trackScroll = debounce(track.bind(null, 'scroll'), 500)
    , trackResize = debounce(track.bind(null, 'resize'), 500)

  addEventListener(window, 'resize', function () {
    // must do this cause IE9 is stupid
    // ... and I'm also seeing some weirdness when tracking in Chrome without it
    if (window.innerWidth !== windowWidth || window.innerHeight !== windowHeight) {
      windowWidth = window.innerWidth
      windowHeight = window.innerHeight
      resizingOffset = Date.now() - startTime
      trackResize()
    }
  })

  addEventListener(window, 'scroll', function () {
    scrollingOffset = Date.now() - startTime
    trackScroll()
  })

  var hidden = document.hidden || document.mozHidden || document.webkitHidden

  // only track this if we can, e.g. if we're running on a modern browser
  if (typeof(hidden) === 'boolean') {
    if (!hidden)
      track('initial visibility', [ 'visible' ])
    else
      track('initial visibility', [ 'hidden' ])
  }

  // use onfocus/onblur so that we get notified whenever a user switches windows
  //  the html5 page visibility api only seem to track changing tabs
  ;[ 'load', 'focus', 'blur' ].forEach(function (eventName) {
    addEventListener(window, eventName, function() { track(eventName) })
  })

  addEventListener(document, 'change', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
      , name = elm ? elm.getAttribute('name') : undefined

    track('change', [ path, name ])
  })

  addEventListener(document, 'click', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
        // href & target is usefull for a-links
      , href = elm ? elm.getAttribute('href') : undefined
      , target = elm ? elm.getAttribute('target') : undefined
      , clickData = [ path, event.screenX, event.screenY, href, target]

    if (elm.tagName === 'A' && href && href[0] !== '#' && target !== '_blank') {
      event.preventDefault()
      track('click', clickData, function () {
        window.location = href
      })
      // if we can't track this click fast enough, just move along and
      // go to the next address
      // TODO: Find the sweetspot for this time
      setTimeout(function () {
        window.location = href
      }, 400)
    } else {
      track('click', clickData)
    }
  })
}
