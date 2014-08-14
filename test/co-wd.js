// TODO: wrap up and release as own library

var thunkify = require('thunkify')

  , methods = [
        'init', 'get', 'quit', 'safeEval', 'elementByCssSelector'
      , 'clickElement'
    ]

  , wrap = function (browser) {
      return methods.reduce(function (obj, fun) {
        obj[fun] = thunkify(browser[fun].bind(browser))

        return obj
      }, {})

    }

module.exports = wrap
