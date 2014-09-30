
condor = require('./condor')()
var xhr = require('xhr')
  , createSocket = require('engine.io-client')

module.exports = function (opts) {

  opts = opts || {}

  var path = opts.path || '/track'
  var wshost = opts.wshost || 'ws://' + location.host
  var socket = createSocket (wshost)

  condor.onevent = function (csv) {
    socket.send(csv)
  }

  // this gets called by beforeunload - so anything in here must be synchronous
  // that's why we're doing a regular (synchronous) xhr-request here
  condor.onend = function (csv) {
    xhr({
        method: 'POST'
      , body: csv
      , uri: path
      , sync: true
      , response: true
    }, function () {})
  }

}
