var utils = {
        waitForEvent: function (eventStream) {
          return function (desiredEventName) {
            return function (callback) {
              eventStream.on('data', function onEvent (data) {
                if (data.eventName === desiredEventName) {
                  eventStream.removeListener('data', onEvent)
                  callback(null, data)
                }
              })
            }
          }
        }
      , createServer: require('./server')
      , isNumber: function (string) {
          return /^\-?[0-9]+$/.test(string)
        }
    }

module.exports = utils