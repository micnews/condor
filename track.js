var addEventListener = require('add-event-listener')
  , debounce = require('debounce')
  , pageVisibility = require('page-visibility')
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

  pageVisibility(function (visible) {
    // getting the visibility make take some time, but the  offset should be 0
    // - it's the visibiltiy that existed when the page was loaded
    track('visibility', [ visible ? 'visible' : 'hidden' ], 0 )
  })

  addEventListener(window, 'load', function () { track('load') })

  addEventListener(window, 'focus', function () { track('visibility', [ 'visible' ]) })
  addEventListener(window, 'blur', function () { track('visibility', [ 'hidden' ]) })

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
