/* global self */
console.log('Service worker starting')

// Port let us with the website, in case it's open right now.
// The Server Worker runs in the background even when the website is closed.
var port = null

var latestNotification = null

self.onmessage = function (e) {
  console.log('Site open, says ' + e.data)
  port = e.ports[0]
}

self.addEventListener('push', function (event) {
  var message = event.data.json()
  fireNotification(message, event)
  if (port) port.postMessage(message)
})

self.addEventListener('notificationclick', function (event) {
  var link
  if (event.action) {
    var actions = latestNotification.actions
    var action = actions.find((x) => x.action === event.action)
    link = action.link
  } else {
    link = latestNotification.link
  }
  self.clients.openWindow(link)
})

function fireNotification (message, event) {
  latestNotification = message

  var title = message.title
  var body = message.body
  var actions = message.actions
  var icon = 'push-icon.png'
  var tag = 'push'

  event.waitUntil(self.registration.showNotification(title, {
    body: body,
    icon: icon,
    tag: tag,
    actions: actions,
    requireInteraction: true
  }))
}
