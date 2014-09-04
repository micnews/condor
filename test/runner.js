var execFile = require('child_process').execFile

  , chalk = require('chalk')
  , co = require('co')
  , each = require('co-each')
  , extend = require('xtend')
  , gap = require('gap')
  , getBrowsers = require('get-saucelabs-browsers')
  , localtunnel = require('localtunnel')
  , read = require('co-read')
  , tape = require('tape')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])
  , thunkify = require('thunkify')

  , build = process.env.TRAVIS_BUILD_NUMBER || (new Date()).toJSON()

  , startServer = function (done) {
      var server = require('./utils/server')()
      server.listen(0, function () { done(null, server) })
    }

  , saucelabsRunner = function* (baseConfig, browsers, setupTests) {

      var browsers = yield thunkify(getBrowsers)(browsers)
        , browserConfigs = browsers.map(function (config) {
            return extend(baseConfig, config)
          })

      yield each(
          browserConfigs
        , function* (config) {
            var browser = require('co-wd').remote('ondemand.saucelabs.com', 80)
              , testOutput = []
              , harness = tape.createHarness()
              , test = gap.inject(harness)
              , buf
              , stream
              , log = function (msg) {
                  var string = config.browserName + ' ' + config.version + ': ' + msg
                  console.log(chalk.magenta(string))
                }

            log('Queued')
            yield browser.init(config)

            log('Started')
            yield setupTests(test, browser)

            // harness.createStream starts running the tests setup in setupTests
            stream = harness.createStream()

            while(buf = yield read(stream)) {
              testOutput.push(buf.toString())
            }

            // fail test on sauce labs if the test fail
            if (harness._results.fail > 0)
              yield browser.sauceJobStatus(false)

            yield browser.quit()
            log('Finished')
            console.log(testOutput.join(''))
          }
      )
    }
  , localRunner = function* (setupTests) {
      // -w means that phantomjs starts with a webdriver connector on port 8910
      var phantomjs = execFile(require('phantomjs').path, [ '-w' ])
        , browser = require('co-wd').remote('localhost', 8910)
        , harness = tape.createHarness()
        , buf
        , stream

      // try to connect to the webdriver connector until it gets live
      yield function tryToConnect (done) {
        var net = require('net')

        var connection = net.connect(8910)
        connection.once('connect', function () {
          connection.end()
          done()
        })
        connection.once('error', function () {
          setTimeout(function () { tryToConnect(done) }, 100 )
        })
      }

      yield browser.init()

      yield setupTests(harness, browser)

      // harness.createStream starts running the tests setup in setupTests
      stream = harness.createStream()
      while(buf = yield read(stream)) {
        process.stdout.write(buf)
      }
      yield browser.quit()
      phantomjs.kill()
    }
  , setupTests = function* (test, browser) {
      var server = yield startServer
        , tunnel = yield thunkify(localtunnel)(server.address().port)

      server.url = tunnel.url

      Object.keys(tests).forEach(function (key) {
        tests[key](test, server, browser)
      })

      // run this in a test-closure to have it running last
      test('tearDown', function* (t) {
        server.close()
        tunnel.close()
      })
    }

  , local = process.argv.indexOf('--local') !== -1

co(function* () {
  if (local) {
    yield localRunner(setupTests)
  } else {
    var baseConfig = {
            name: 'condor'
          , build: build
          , public: 'public'
        }

    yield saucelabsRunner(
        baseConfig
      , require('../package.json').browsers
      , setupTests
    )
  }
})()