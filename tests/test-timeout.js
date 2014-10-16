'use strict'

if (process.env.TRAVIS === 'true') {
  console.error('This test is unreliable on Travis; skipping.')
  process.exit(0)
}

var server = require('./server')
  , events = require('events')
  , stream = require('stream')
  , request = require('../index')
  , tape = require('tape')

var s = server.createServer()

// Request that waits for 200ms
s.on('/timeout', function(req, res) {
  setTimeout(function() {
    res.writeHead(200, {'content-type':'text/plain'})
    res.write('waited')
    res.end()
  }, 200)
})

tape('setup', function(t) {
  s.listen(s.port, function() {
    t.end()
  })
})

tape('should timeout', function(t) {
  var shouldTimeout = {
    url: s.url + '/timeout',
    timeout: 100
  }

  request(shouldTimeout, function(err, res, body) {
    t.equal(err.code, 'ETIMEDOUT')
    t.end()
  })
})

tape('should timeout with events', function(t) {
  t.plan(2)

  var shouldTimeoutWithEvents = {
    url: s.url + '/timeout',
    timeout: 100
  }

  var eventsEmitted = 0
  request(shouldTimeoutWithEvents)
    .on('error', function(err) {
      eventsEmitted++
      t.equal(1, eventsEmitted)
      t.equal(err.code, 'ETIMEDOUT')
    })
})

tape('should not timeout', function(t) {
  var shouldntTimeout = {
    url: s.url + '/timeout',
    timeout: 1200
  }

  request(shouldntTimeout, function(err, res, body) {
    t.equal(err, null)
    t.equal(body, 'waited')
    t.end()
  })
})

tape('no timeout', function(t) {
  var noTimeout = {
    url: s.url + '/timeout'
  }

  request(noTimeout, function(err, res, body) {
    t.equal(err, null)
    t.equal(body, 'waited')
    t.end()
  })
})

tape('negative timeout', function(t) { // should be treated a zero or the minimum delay
  var negativeTimeout = {
    url: s.url + '/timeout',
    timeout: -1000
  }

  request(negativeTimeout, function(err, res, body) {
    t.equal(err.code, 'ETIMEDOUT')
    t.end()
  })
})

tape('float timeout', function(t) { // should be rounded by setTimeout anyway
  var floatTimeout = {
    url: s.url + '/timeout',
    timeout: 100.76
  }

  request(floatTimeout, function(err, res, body) {
    t.equal(err.code, 'ETIMEDOUT')
    t.end()
  })
})

tape('cleanup', function(t) {
  s.close()
  t.end()
})
