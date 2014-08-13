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

track.onend = function (csv, callback) {
  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
  }, callback)
}