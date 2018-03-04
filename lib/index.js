'use strict'

var path = require('path')
var glob = require('glob')
var castArray = require('cast-array')

function prefixRoute (route, prefixer) {
  return Array.isArray(route)
    ? route.map(r => prefixRoute(r, prefixer))
    : { ...route, path: prefixer(route.path) }
}

function defaultPrefix (fpath, rpath) {
  return '/' + path.dirname(fpath) + rpath
}

exports.plugin = {
  register: (server, options) => {
    var opts = {
      prefix: defaultPrefix,
      cwd: process.cwd(),
      ...options
    }

    var globOptions = {
      nodir: true,
      strict: true,
      cwd: opts.cwd,
      ignore: opts.ignore
    }

    castArray(options.routes).forEach(function (pattern) {
      var files = glob.sync(pattern, globOptions)

      files.forEach(function (relPath) {
        var absPath = globOptions.cwd + '/' + relPath
        var route = require(absPath)
        var prefixer = opts.prefix.bind(null, relPath)
        server.route(prefixRoute(route.default || route, prefixer))
      })
    })
  },

  pkg: require('../package.json')
}
