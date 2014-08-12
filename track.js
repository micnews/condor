var getCssPath = require('css-path')

  , windowWidth = window.innerWidth
  , windowHeight = window.innerHeight

  , esc = function (cell) {
      return /[,\r\n"]/.test(cell) ? '"'+cell.replace(/"/g, '""')+'"' : cell
    }

  , startTime = Date.now()

  , isScrolling = false
  , isResizing = false
  , scrollingOffset = 0
  , resizingOffset = 0

module.exports = function (callback) {
  var track = function (eventType, extra, offset, done) {
        if (typeof(offset) === 'function') {
          done = offset
          offset = Date.now() - startTime
        }

        done = done || function () {}
        extra = extra || []
        offset = typeof(offset) === 'number' ? offset : Date.now() - startTime

        var csv = [
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
            .map(esc)
            .join(',')

        callback(csv, done)
      }

  window.onresize = function () {
    // must do this cause IE9 is stupid
    // ... and I'm also seeing some weirdness when tracking in Chrome without it
    if (window.innerWidth !== windowWidth || window.innerHeight !== windowHeight) {
      windowWidth = window.innerWidth
      windowHeight = window.innerHeight
      resizingOffset = Date.now() - startTime
      if (!isResizing) {
        isResizing = true
        setTimeout(function () {
          track('resize', [], resizingOffset)
          isResizing = false
        }, 500)
      }
    }
  }

  window.onscroll = function () {
    scrollingOffset = Date.now() - startTime
    if (!isScrolling) {
      isScrolling = true
      setTimeout(function () {
        track('scroll', [], scrollingOffset)
        isScrolling = false
      }, 500)
    }
  }

  window.onload = function () {
    track('load')
  }

  track('init')

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
  window.onfocus = function () {
    track('focus')
  }

  window.onblur = function () {
    track('blur')
  }

  document.onchange = function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
      , name = elm ? elm.getAttribute('name') : undefined

    track('change', [ path, name ])
  }

  document.onclick = function (event) {
    event = event || window.event

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
  }
}
