var socket = require('engine.io-client')('ws://localhost')
  , condor = require('../../condor')()
  , xhr = require('xhr')

condor.onevent = function (csv) {
  socket.send(csv)
}

// this gets called by beforeunload - so anything in here must be synchronous
// that's why we're doing a regular (synchronous) xhr-request here
condor.onend = function (csv) {
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
    , sync: true
    , response: true
  }, function () {})
}