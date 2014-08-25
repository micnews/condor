// this file must be run in gnode or similar, to have generators support

var test = require('gap')
  , localtunnel = require('localtunnel')

  , utils = require('./utils')
  , server = utils.createServer()
  , browser = require('co-wd').remote('ondemand.saucelabs.com', 80)
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])
  , tunnel
  , build = (new Date()).toJSON()

require('co')(function* () {
  var browsers = yield require('./utils/saucelabs')

  // TODO: run this in parallel
  browsers.forEach(function (browserConfig) {
    test('setup (' + browserConfig.name + ' ' + browserConfig.version + ')', function* () {
      yield browser.init({
          name: 'condor'
        , browserName: browserConfig.name
        , version: browserConfig.version
        , platform: browserConfig.platform
        , build: build
      })
      yield server.listen.bind(server, 0)
      tunnel = yield localtunnel.bind(localtunnel, server.address().port)
      server.url = tunnel.url
    })

    Object.keys(tests).forEach(function (key) {
      tests[key](server, browser)
    })

    test('teardown', function* () {
      yield browser.quit()
      tunnel.close()
      server.close()
    })
  })


})()
