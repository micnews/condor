var debounce = require('debounce')
  , xhr = require('xhr')
  , track = require('../track')()

  , noop = function () {}
  , data = []

    // save all events happening within a second and send them in one POST
    //  request
  , batchPost = debounce(function () {
      var body = data.join('\n')
      data = []

      xhr({
          method: 'POST'
        , body: body
        , uri: '/track'
      }, noop)
    }, 1000)

track.onevent = function (csv) {
  data.push(csv)
  batchPost()
}

// this gets called by beforeunload - so anything in here must be synchronous
track.onend = function (csv) {
  data.push(csv)

  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: data.join('\n')
    , uri: '/track'
    , sync: true
  }, noop)
}