// TODO: move portions of this script to a separate module

// these should probably be extracted to separate module
var flattenBrowser = require('zuul/lib/flatten_browser')
  , scoutBrowser = require('zuul/lib/scout_browser')

    // borrowen naming from testling
    // TODO get this list from some config/specific repo
    // QUESTION: Is this enough, or should we be able to specify OS?
  , browsersConf = [
        'internet explorer/9..latest'
      , 'chrome/latest'
      , 'firefox/latest'
      , 'safari/latest'
      , 'opera/latest'
    ]

  , getBrowsers = function (callback) {
      var requestedBrowsers = browsersConf.map(function (row) {
            row = row.split('/')

            return {
                name: row[0]
              , version: row[1]
            }
          })

      scoutBrowser(function (err, available) {
        if (err)
          return callback(err)

        callback(null, flattenBrowser(requestedBrowsers, available))
      })
    }

module.exports = getBrowsers