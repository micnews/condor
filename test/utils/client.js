// this file will be browserified

condor = require('../../condor')()
var xhr = require('xhr')

condor.onevent = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
    , response: true
  }, function () {})
}

condor.onend = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
    , sync: true
    , response: true
  }, function () {})
}
