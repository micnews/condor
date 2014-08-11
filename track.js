var getCssPath = require('./css-path')

  , windowWidth = window.innerWidth
  , windowHeight = window.innerHeight

  , esc = function (cell) {
      return /[,\r\n"]/.test(cell) ? '"'+cell.replace(/"/g, '""')+'"' : cell
    }

  , startTime = Date.now()

  , isScrolling = false
  , isResizing = false

module.exports = function (callback) {
  var track = function (eventType, extra, offset) {
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
            ]
            .concat(extra)
            .map(esc)
            .join(',')

        callback(csv)
      }

  window.onresize = function () {
    // must do this cause IE9 is stupid
    // ... and I'm also seeing some weirdness when tracking in Chrome without it
    if (window.innerWidth !== windowWidth || window.innerHeight !== windowHeight) {
      windowWidth = window.innerWidth
      windowHeight = window.innerHeight
      if (!isResizing) {
        isResizing = true
        setTimeout(function () {
          track('resize')
          isResizing = false
        }, 500)
      }
    }
  }

  window.onscroll = function () {
    if (!isScrolling) {
      isScrolling = true
      setTimeout(function () {
        track('scroll')
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

  document.onclick = function (event) {
    event = event || window.event

    var elm = event.toElement
      , path = elm ? getCssPath(elm) : undefined
      , href = elm ? elm.getAttribute('href') : undefined

    track('click', [ event.screenX, event.screenY, path, href ])
  }
}
