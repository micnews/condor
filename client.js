var xhr = require('xhr')

require('./track')(function (csv, callback) {
  xhr({
      method: 'POST'
    , body: csv
    , uri: '/track'
  }, callback)
})