// TODO: wrap up and release as own library

var thunkify = require('thunkify')
  , wrap = function (browser) {
      return ['init', 'get', 'quit', 'safeEval'].reduce(function (obj, fun) {
        obj[fun] = thunkify(browser[fun].bind(browser))

        return obj
      }, {})

    }

module.exports = wrap
