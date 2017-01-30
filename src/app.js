const ERR_NONE = 0
const ERR_UNSUPPORTED_BROWSER = 1
const ERR_NOTIFICATIONS_DENIED = 2
const ERR_PUSH_SUBSCRIPTION_FAILED = 3

const PUSH_UNKNOWN = 0
const PUSH_UNSUBSCRIBED = 1
const PUSH_SUBSCRIBED = 2

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
      state.isPushSubscribed = subscription ? PUSH_SUBSCRIBED : PUSH_UNSUBSCRIBED
      state.pushSubscription = subscription
      if (!subscription) return

      console.log('Got existing push subscription: ' + subscription.toJSON())
    })

  // Create a message channel to communicate with the service worker
  var channel = new window.MessageChannel()
  channel.port1.onmessage = function (e) {
    console.log('Got channel message from service worker', e)
  }

  state.worker.postMessage('hello', [channel.port2])
}

function subscribe () {
  state.workerReg.pushManager
    .subscribe({userVisibleOnly: true})
    .then(function (subscription) {
      state.pushSubscription = subscription
      state.isPushSubscribed = PUSH_SUBSCRIBED
      updateUI()

      // Tell the app server we have a new subscriber
      postSubscribe('subscribe', subscription)
    })
    .catch(function (e) {
      if (window.Notification.permission === 'denied') {
        state.error = ERR_NOTIFICATIONS_DENIED
      } else {
        console.error(e)
        state.error = ERR_PUSH_SUBSCRIPTION_FAILED
      }
    })
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

function unsubscribe () {
  postSubscribe('unsubscribe', state.pushSubscription)
  state.workerReg.pushManager
    .unsubscribe()
    .then(function () {
      state.pushSubscription = null
      state.isPushSubscribed = PUSH_UNSUBSCRIBED
    })
}

function postSubscribe (statusType, subscription) {
  console.log('POSTing ' + statusType + ': ' + subscription)

  var request = new window.XMLHttpRequest()
  request.open('POST', document.location.origin)
  request.setRequestHeader('Content-Type', 'application/json')
  request.send(subscription.toJSON())
}

function updateUI () {
  document.querySelector('#service-worker-status').innerText = state.workerState

  var button = document.querySelector('#toggle-subscribe')
  button.disabled = state.workerState !== 'activated'

  if (state.error === ERR_UNSUPPORTED_BROWSER) show('#error-unsupported-browser')
  else if (state.error === ERR_NOTIFICATIONS_DENIED) show('#error-notifications-denied')
  else if (state.error === ERR_PUSH_SUBSCRIPTION_FAILED) show('#error-push-subscription-failed')
  else if (state.error > 0) throw new Error('unsupported error ' + state.error)

  var buttonText = state.isPushSubscribed ? 'unsubscribe' : 'subscribe'
  document.querySelector('#toggle-subscribe').innerText = buttonText
}

function show (selector) {
  document.querySelector(selector).style.display = 'block'
}
