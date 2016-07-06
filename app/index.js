/*
 * App entry point with ES6 support on runtime.
 */

// unlock ES6 features
require('babel-register')

// transform and run the api
module.exports = require('./core')
