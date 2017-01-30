var ERR_NONE = 0
var ERR_UNSUPPORTED_BROWSER = 1
var ERR_NOTIFICATIONS_DENIED = 2
var ERR_PUSH_SUBSCRIPTION_FAILED = 3

var PUSH_UNKNOWN = 0
var PUSH_UNSUBSCRIBED = 1
var PUSH_SUBSCRIBED = 2

// Browserify brfs turns this into a constant at compile time
var fs = require('fs')
var VAPID_PUBLIC_KEY = fs.readFileSync('public-key.dat')

// Keep all state in one place.
var state = module.exports = {
  error: ERR_NONE,
  isPushSubscribed: PUSH_UNKNOWN,
  workerState: 'not installed',
  workerReg: null,
  worker: null
}

main()

function main () {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Notification.permission: ' + window.Notification.permission)
    if (window.Notification.permission === 'denied') state.error = ERR_NOTIFICATIONS_DENIED
    registerServiceWorker()
  } else {
    state.error = ERR_UNSUPPORTED_BROWSER
  }

  handleUIEvents()
  updateUI()
}

function registerServiceWorker () {
  console.log('Registering service worker...')

  navigator.serviceWorker.register('bundle.js').then(function (registration) {
    state.workerReg = registration

    var worker
    if (registration.installing) worker = registration.installing
    else if (registration.waiting) worker = registration.waiting
    else if (registration.active) worker = registration.active
    else return

    state.worker = worker
    handleWorkerStateChange()
    worker.addEventListener('statechange', handleWorkerStateChange)
  }).catch(function (error) {
    console.error(error)
    state.error = error.message
    updateUI()
  })
}

function handleWorkerStateChange () {
  var worker = state.worker
  if (worker) state.workerState = worker.state
  if (worker && worker.state === 'activated') handleWorkerReady()
  console.log('Worker state change: ' + state.workerState)
  updateUI()
}

function handleWorkerReady () {
  var registration = state.workerReg
  if (!registration.showNotification) {
    console.log('ServiceWorker Notifications missing')
  }

  registration.pushManager.getSubscription()
    .then(function (subscription) {
      state.pushSubscription = subscription
      state.isPushSubscribed = subscription ? PUSH_SUBSCRIBED : PUSH_UNSUBSCRIBED
      updateUI()
    })

  // Create a message channel to communicate with the service worker
  var channel = new window.MessageChannel()
  channel.port1.onmessage = function (e) {
    console.log('Got channel message from service worker', e)
  }

  state.worker.postMessage('hello', [channel.port2])
}

// Subscribe to push notifications. Calls cb(err || null) when done.
function subscribe (cb) {
  state.workerReg.pushManager
    .subscribe({userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY})
    .then(function (subscription) {
      state.pushSubscription = subscription
      state.isPushSubscribed = PUSH_SUBSCRIBED
      updateUI()

      // Tell the app server we have a new subscriber
      postSubscribe('subscribe', subscription)

      cb(null)
    })
    .catch(function (e) {
      if (window.Notification.permission === 'denied') {
        state.error = ERR_NOTIFICATIONS_DENIED
      } else {
        console.error(e)
        state.error = ERR_PUSH_SUBSCRIPTION_FAILED
      }
      cb(e)
    })
}

// Unsubscribe from push notifications. Calls cb(err || null) when done.
function unsubscribe (cb) {
  postSubscribe('unsubscribe', state.pushSubscription)
  state.pushSubscription
    .unsubscribe()
    .then(function () {
      state.pushSubscription = null
      state.isPushSubscribed = PUSH_UNSUBSCRIBED
      updateUI()

      cb(null)
    })
    .catch(function (e) {
      console.error('Unsubscribe failed', e)
      cb(e)
    })
}

// Let the application server know if we're subscribing or unsubscribing.
function postSubscribe (type, subscription) {
  console.log('Notifying application server: ' + type)
  var message = {
    type: type,
    subscription: subscription.toJSON()
  }

  var request = new window.XMLHttpRequest()
  request.open('POST', document.location.origin)
  request.setRequestHeader('Content-Type', 'application/json')
  request.send(JSON.stringify(message))
}

// Poor man's React: avoid the dependencies, avoid the build complexity, but still keep
// all the UI code in one place. Make the UI a function of a global state object.
function updateUI () {
  document.querySelector('#service-worker-status').innerText = state.workerState

  var button = document.querySelector('#toggle-subscribe')
  button.disabled = state.workerState !== 'activated'

  if (state.error === ERR_UNSUPPORTED_BROWSER) show('#error-unsupported-browser')
  else if (state.error === ERR_NOTIFICATIONS_DENIED) show('#error-notifications-denied')
  else if (state.error === ERR_PUSH_SUBSCRIPTION_FAILED) show('#error-push-subscription-failed')
  else if (state.error > 0) throw new Error('unsupported error ' + state.error)

  var buttonText = state.isPushSubscribed === PUSH_SUBSCRIBED ? 'unsubscribe' : 'subscribe'
  document.querySelector('#toggle-subscribe').innerText = buttonText
}

function handleUIEvents () {
  var button = document.querySelector('#toggle-subscribe')
  button.addEventListener('click', function () {
    button.disabled = true
    if (state.isPushSubscribed === PUSH_SUBSCRIBED) unsubscribe(reenable)
    else if (state.isPushSubscribed === PUSH_UNSUBSCRIBED) subscribe(reenable)
  })
  function reenable () {
    button.disabled = false
  }
}

function show (selector) {
  document.querySelector(selector).style.display = 'block'
}
