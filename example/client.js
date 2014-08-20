var debounce = require('debounce')
  , xhr = require('xhr')
  , condor = require('../condor')()

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
        , uri: '/condor'
        , response: true
      }, noop)
    }, 1000)

condor.onevent = function (csv) {
  data.push(csv)
  batchPost()
}

// this gets called by beforeunload - so anything in here must be synchronous
condor.onend = function (csv) {
  data.push(csv)

  // this will be an end-event - meaning that the visit on the page has ended
  xhr({
      method: 'POST'
    , body: data.join('\n')
    , uri: '/track'
    , sync: true
    , response: true
  }, noop)
}