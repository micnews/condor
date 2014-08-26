var localtunnel = require('localtunnel')
  , test = require('gap')
  , tests = require('bulk-require')(__dirname, [ '*-test.js' ])
  , browser = require('co-wd').remote('ondemand.saucelabs.com', 80)
  , utils = require('./utils')
  , server = utils.createServer()
  , browserConfig = JSON.parse(process.argv[2])
  , build = process.argv[3]

console.log('Browser: %s %s', browserConfig.name, browserConfig.version)
test('setup browser, server & tunnel', function* () {
  yield server.listen.bind(server, 0)
  tunnel = yield localtunnel.bind(localtunnel, server.address().port)

  tunnel.tunnel_cluster.on('error', function (err) {
    if (!err.code || err.code !== 'ETIMEDOUT') {
      throw err
    }
  })

  server.url = tunnel.url
  yield browser.init({
      name: 'condor'
    , browserName: browserConfig.name
    , version: browserConfig.version
    , platform: browserConfig.platform
    , build: build
  })
})

Object.keys(tests).forEach(function (key) {
  tests[key](server, browser)
})

test('teardown browser & server', function* (t) {
  server.unref()
  tunnel.close()
  yield browser.sauceJobStatus(t.harness.output.results.ok)
  yield browser.quit()
})
