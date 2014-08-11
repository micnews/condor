var xhr = require('xhr')

require('./track')(function (csv) {
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
  }, function () {})
})