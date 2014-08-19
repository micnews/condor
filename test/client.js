// this file will be browserified

var condor = require('../condor')()
  , xhr = require('xhr')

condor.onevent = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
  }, function () {})
}

condor.onend = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
    , sync: true
  }, function () {})
}
