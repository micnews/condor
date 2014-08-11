var xhr = require('xhr')

  , windowWidth = window.innerWidth
  , windowHeight = window.innerHeight

  , esc = function (cell) {
      return /[,\r\n"]/.test(cell) ? '"'+cell.replace(/"/g, '""')+'"' : cell
    }

  , startTime = Date.now()

  , track = function (eventName, value) {
      var csv = [
              eventName
            , window.innerWidth
            , window.innerHeight
            , window.scrollX
            , window.scrollY
            , window.location.toString()
            , Date.now() - startTime
            , navigator.userAgent
          ]
          .map(esc)
          .join(',')

      xhr({
          method: 'POST'
        , body: csv
        , uri: '/track'
      }, function () {})
    }
  , isScrolling = false
  , isResizing = false

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

if (typeof(hidden) === 'boolean') {
  if (!hidden)
    track('visible')
  else
    track('hidden')
}

// use onfocus/onblur so that we get notified whenever a user switches windows
//  the html5 page visibility api only seem to track changing tabs
window.onfocus = function () {
  track('focus')
}

window.onblur = function () {
  track('blur')
}

document.onclick = function () {
  track('click')
}
