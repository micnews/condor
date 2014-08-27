var co = require('co')
  , each = require('co-each')
  , extend = require('xtend')
  , getBrowsers = require('get-saucelabs-browsers')
  , localtunnel = require('localtunnel')
  , read = require('co-read')
  , tape = require('tape')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])

  , build = process.env.TRAVIS_BUILD_NUMBER || (new Date()).toJSON()

  , createTest = function (test) {
      return function (name, fn) {
        test(name, function (t) {
          co(function* (){
            try {
              yield fn(t)
            } catch(err) {
              t.error(err)
            }
            t.end()
          })()
        })
      }
    }

  , startServer = function (done) {
      var server = require('./utils/server')()
      server.listen(0, function () { done(null, server) })
    }
  , runTestsOnBrowser = function* (config) {
      config = extend(
          {
              name: 'condor'
            , build: build
            , public: 'public'
          }
        , config
      )

      var browser = require('co-wd').remote('ondemand.saucelabs.com', 80)
        , server = yield startServer
        , tunnel = yield localtunnel.bind(localtunnel, server.address().port)
        , browserName = config.browserName + ' ' + config.version

      server.url = tunnel.url

      console.log('queued', browserName)
      yield browser.init(config)
      console.log('started', browserName)

        var result = []
        , harness = tape.createHarness()
        , stream = harness.createStream()
        , test = createTest(harness)
        , buf

      Object.keys(tests).forEach(function (key) {
        tests[key](test, server, browser)
      })

      while(buf = yield read(stream)) {
        result.push(buf)
      }

      yield browser.quit()
      console.log('finished', browserName)
      console.log(result.join(''))

      server.unref()
      tunnel.close()
    }

  , local = process.argv.indexOf('--local') !== -1 || process.argv.indexOf('-l') !== -1

co(function* () {
  var configs = yield getBrowsers.bind(null, require('../package.json').browsers)

  yield each(
      configs
    , runTestsOnBrowser
  )
})()
