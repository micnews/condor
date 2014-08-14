var addEventListener = require('add-event-listener')
  , debounce = require('debounce')
  , pageVisibility = require('page-visibility')
  , getCssPath = require('css-path')
  , toCsv = require('csv-line')({ escapeNewlines: true })

  , slice = Array.prototype.slice

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
  , isTrackable = function (elm) {
      return elm.getAttribute('data-trackable-type') && elm.getAttribute('data-trackable-value')
    }
  , findTrackable = function (elm) {
      var trackable = []

      for(; !!elm.tagName; elm = elm.parentNode) {
        if (isTrackable(elm))
          trackable.push(elm)
      }

      return trackable
    }
  , findAllTrackable = function () {
      return slice.call(document.querySelectorAll('[data-trackable-type][data-trackable-value'))
    }

Track.prototype._toCsv = function (eventType, extra, offset) {
  offset = typeof(offset) === 'number' ? offset : Date.now() - this._startTime

  extra = extra || {}

  var array = [
          eventType
        , window.innerWidth
        , window.innerHeight
        , window.scrollX
        , window.scrollY
        , window.location.toString()
        , offset
        , document.referrer
        , extra.path
        , extra.clickX
        , extra.clickY
        , extra.href
        , extra.target
        , extra.visibility
        , extra.name
        , extra.trackableType
        , extra.trackableValue
      ]

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
    , trackTrackable = function (eventType, elm) {
        track(
            eventType
          , {
                trackableValue: elm.getAttribute('data-trackable-value')
              , trackableType: elm.getAttribute('data-trackable-type')
            }
        )
      }
    , trackVisibleTrackingElements = function () {
        findAllTrackable().forEach(function (elm) {
          if (elm.getBoundingClientRect().top < window.innerHeight && !elm.trackedVisibility) {
            elm.trackedVisibility = true
            trackTrackable('trackable-visible', elm)
          }
        })
      }

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

    trackVisibleTrackingElements()

    trackScroll()
  })

  pageVisibility(function (visible) {
    // getting the visibility make take some time, but the  offset should be 0
    // - it's the visibiltiy that existed when the page was loaded
    track('visibility', { visibility: visible ? 'visible' : 'hidden' }, 0 )
  })

  addEventListener(window, 'load', function () {
    track('load')

    findAllTrackable().forEach(function (elm) {
      trackTrackable('trackable-load', elm)
    })

    trackVisibleTrackingElements()
  })

  addEventListener(window, 'focus', function () {
    track('visibility', { visibility: 'visible' })
  })
  addEventListener(window, 'blur', function () {
    track('visibility', { visibility: 'hidden' })
  })

  addEventListener(document, 'change', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
      , name = elm ? elm.getAttribute('name') : undefined

    track('change', { path: path, name: name })
  })

  addEventListener(window, 'beforeunload', function (event) {
    self.onend(self._toCsv('end'))
  })

  addEventListener(document, 'click', function (event) {
    var elm = event.target
      , path = elm ? getCssPath(elm, document.body) : undefined
        // href & target is useful for a-element
        // if we're in a subelement, see if there's a parentNode that's
        // an a-element
      , aElm = (function (aElm) {
          for(aElm = aElm; aElm.tagName; aElm = aElm.parentNode ) {
            if (aElm.tagName === 'A')
              return aElm
          }
        })(elm)
      , href = aElm ? aElm.getAttribute('href') : undefined
      , target = aElm ? aElm.getAttribute('target') : undefined
      , extra = { path: path, event: event.screenX, screenY: event.screenY, href: href, target: target }

    track('click', extra)

    findTrackable(elm).forEach(function (trackElm) {
      trackTrackable('trackable-click', trackElm)
    })
  })

  addEventListener(document, 'mouseover', function (event) {
    var elm = event.target

    findTrackable(elm).forEach(function (trackElm) {
      trackTrackable('trackable-hover', trackElm)
    })
  })
}

module.exports = Track
