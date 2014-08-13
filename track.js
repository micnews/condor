var addEventListener = require('add-event-listener')
  , debounce = require('debounce')
  , pageVisibility = require('page-visibility')
  , getCssPath = require('css-path')
  , toCsv = require('csv-line')({ escapeNewlines: true })

  , Track = function () {
      if (!(this instanceof Track))
        return new Track()

      this._startTime = Date.now()
      this._windowWidth = []
      this._windowHeight = []
      this._scrollOffset = 0
      this._resizeOffset = 0
      this.ondata = null
      this.onend = null
      this._startTracking()
    }

Track.prototype._toCsv = function (eventType, extra, offset) {
  offset = typeof(offset) === 'number' ? offset : Date.now() - this._startTime

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

  if (extra)
    array = array.concat(extra)

  return toCsv(array)
}

Track.prototype._startTracking = function () {
  var self = this
    , track = function (eventType, extra, offset) {
        var csv = self._toCsv(eventType, extra, offset)

        if (self.ondata)
          self.ondata(csv)
      }
    , trackScroll = debounce(track.bind(null, 'scroll'), 500)
    , trackResize = debounce(track.bind(null, 'resize'), 500)

  addEventListener(window, 'resize', function () {
    // must do this cause IE9 is stupid
    // ... and I'm also seeing some weirdness when tracking in Chrome without it
    if (window.innerWidth !== self._windowWidth || window.innerHeight !== self._windowHeight) {
      self._windowWidth = window.innerWidth
      self._windowHeight = window.innerHeight
      self._resizeOffset = Date.now() - self._startTime
      trackResize()
    }
  })

  addEventListener(window, 'scroll', function () {
    self._scrollOffset = Date.now() - self._startTime
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

  addEventListener(window, 'beforeunload', function (event) {
    self.onend(self._toCsv('end'))
  })

  addEventListener(document, 'click', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
        // href & target is usefull for a-links
      , href = elm ? elm.getAttribute('href') : undefined
      , target = elm ? elm.getAttribute('target') : undefined
      , extra = [ path, event.screenX, event.screenY, href, target]

    track('click', extra)
  })
}

module.exports = Track
