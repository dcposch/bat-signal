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
    var worker
    if (registration.installing) worker = registration.installing
    else if (registration.waiting) worker = registration.waiting
    else if (registration.active) worker = registration.active
    if (worker) {
      state.serviceWorker.status = worker.state
      state.serviceWorker.worker = worker
      worker.addEventListener('statechange', function (e) {
        state.serviceWorker.status = worker.state
        updateUI()
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
