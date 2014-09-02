var co = require('co')
  , each = require('co-each')
  , extend = require('xtend')
  , gap = require('gap')
  , getBrowsers = require('get-saucelabs-browsers')
  , localtunnel = require('localtunnel')
  , read = require('co-read')
  , tape = require('tape')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])

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

  , customRunner = function* (baseConfig, browsers, setupTests) {

      console.log('Start running test')
      console.log(baseConfig)

      var browserConfigs = (yield getBrowsers.bind(null, browsers)).map(function (config) {
            return extend(baseConfig, config)
          })

      yield each(
          browserConfigs
        , function* (config) {
            var browser = require('co-wd').remote('ondemand.saucelabs.com', 80)
              , browserName = config.browserName + ' ' + config.version
              , result = []
              , harness = tape.createHarness()
              , test = gap.inject(harness)
              , buf
              , stream

            console.log('Queueing', browserName)
            yield browser.init(config)

            console.log('Running tests on ', browserName)
            yield setupTests(test, browser)

            // harness.createStream starts running the tests setup in setupTests
            stream = harness.createStream()

            console.log('stream', stream)

            while(buf = yield read(stream)) {
              console.log('read from stream')
              result.push(buf.toString())
            }

            yield browser.quit()
            console.log('finished', browserName)
            console.log(result.join(''))
          }
      )
    }

co(function* () {
  yield customRunner(
      baseConfig
    // , require('../package.json').browsers
    , [ 'internet explorer/10' ]
    , function* (test, browser) {

        var server = yield startServer
          , tunnel = yield localtunnel.bind(localtunnel, server.address().port)

        server.url = tunnel.url

        Object.keys(tests).forEach(function (key) {
          tests[key](test, server, browser)
        })

        // run this in a test-closure to have it running last
        test('tearDown', function* (t) {
          console.log('tearDown')
          server.close()
          tunnel.close()
        })
      }
  )
})()
