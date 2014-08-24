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
      , 'opera/11.0..latest'
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
        console.log('available', available)

        var browsers = flattenBrowser(requestedBrowsers, available)

        console.log('list of browsers')
        console.log(browsers)

      })
    }

  , setupTunnel = function (callback) {

    }

getBrowsers(function (err, browsers) {
  console.log('browsers', browsers)
})

// 1. Get browsers to test & setup tunnel (in parallel)
// 2. Run tests somehow, perhaps by rurnnin each test in it's own process
//    and save/parse each tap-output separatly
//    TODO: think about a good way to now run to many tests in parallel,
//      queue up tests that aren't aloowed. Can logic from this be borrow from
//      zuul?
// 3. Update pass/fail results in saucelabs rependent on the results from the
//    tap results
// 4. Figure out a simple way to run the tests in phantomjs