(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Keep all state in one place.
var state = {
  error: null,
  serviceWorker: {
    status: 'not installed',
    worker: null
  }
}

main()

function main () {
  if ('serviceWorker' in navigator) {
    registerServiceWorker()
  } else {
    state.error = 'sorry, your browser doesn\'t support push notifications. ' +
      'try the latest Chrome or Firefox.'
  }
  updateUI()
}

function registerServiceWorker () {
  navigator.serviceWorker.register('bundle.js', {
    scope: './'
  }).then(function (registration) {
    var serviceWorker
    if (registration.installing) {
      serviceWorker = registration.installing
      state.serviceWorker.status = 'installing'
    } else if (registration.waiting) {
      serviceWorker = registration.waiting
      state.serviceWorker.status = 'waiting'
    } else if (registration.active) {
      serviceWorker = registration.active
      state.serviceWorker.status = 'active'
    }
    if (serviceWorker) {
      console.log('worker state ' + serviceWorker.state)
      serviceWorker.addEventListener('statechange', function (e) {
        console.log('worker state changed ' + serviceWorker.state)
      })
    }
    updateUI()
  }).catch(function (error) {
    console.error(error)
    state.error = error.message
    updateUI()
  })
}

function updateUI () {
  document.querySelector('#service-worker-status').innerText = state.serviceWorker.status
  document.querySelector('#error').innerText = state.errorMessage || ''
}

},{}],2:[function(require,module,exports){
/* global self */
if (self.Window && (self instanceof self.Window)) {
  require('./app')
} else {
  require('./service-worker')
}

},{"./app":1,"./service-worker":3}],3:[function(require,module,exports){
/* global self */

var port

self.onmessage = function (e) {
  console.log(e)
  port = e.ports[0]
}

self.addEventListener('push', function (event) {
  var obj = event.data.json()

  if (obj.action === 'subscribe' || obj.action === 'unsubscribe') {
    fireNotification(obj, event)
    port.postMessage(obj)
  } else if (obj.action === 'init' || obj.action === 'chatMsg') {
    port.postMessage(obj)
  }
})

function fireNotification (obj, event) {
  var title = 'Subscription change'
  var body = obj.message
  var icon = 'push-icon.png'
  var tag = 'push'

  event.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: icon,
    tag: tag
  }))
}

},{}]},{},[2]);
