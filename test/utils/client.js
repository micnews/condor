// this file will be browserified

var tracking = require('../../track')()
  , xhr = require('xhr')

tracking.onevent = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
  }, function () {})
}

tracking.onend = function (csv) {
  xhr({
      method: 'post'
    , body: csv
    , uri: '/track'
    , sync: true
  }, function () {})
}
