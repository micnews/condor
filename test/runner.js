var localtunnel = require('localtunnel')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])
  , thunkify = require('thunkify')

  , build = process.env.TRAVIS_BUILD_NUMBER || (new Date()).toJSON()

  , startServer = function (done) {
      var server = require('./utils/server')()
      server.listen(0, function () { done(null, server) })
    }

  , baseConfig = {
        name: 'condor'
      , build: build
      , public: 'public'
    }

  , setupTests = function* (test, browser) {
      var server = yield startServer
        , tunnel

      if (local) {
        server.url = 'http://localhost:' + server.address().port
      } else {
        tunnel = yield thunkify(localtunnel)(server.address().port)
        server.url = tunnel.url
      }

      Object.keys(tests).forEach(function (key) {
        tests[key](test, server, browser)
      })

      // run this in a test-closure to have it running last
      test('tearDown', function* (t) {
        server.close()
        if (tunnel)
          tunnel.close()
      })
    }

  , local = process.argv.indexOf('--local') !== -1

require('co-webdriver-runner')({
    local: local
  , baseConfig: baseConfig
  , browsers: require('../package.json').browsers
  , test: setupTests
})
