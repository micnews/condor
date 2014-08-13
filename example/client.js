var xhr = require('xhr')
  , track = require('../track')()

  , noop = function () {}

track.ondata = function (csv) {
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
  }, noop)
}

// this gets called by beforeunload - so anything in here must be synchronous
track.onend = function (csv) {
  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
    , sync: true
  }, noop)
}