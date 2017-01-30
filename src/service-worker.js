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
