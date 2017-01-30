/* global self */
if (self.Window && (self instanceof self.Window)) {
  window.state = require('./app')
} else {
  // We're in the ServiceWorker.
  // self contains [ "clients", "registration",
  // "onactivate", "onfetch", "oninstall", "onmessage",
  // "onsync", "onnotificationclick", "onnotificationclose", "onpush",
  // "fetch", "skipWaiting", "console" ]
  require('./service-worker')
}
