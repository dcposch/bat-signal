const ERR_NONE = 0
const ERR_UNSUPPORTED_BROWSER = 1
const ERR_NOTIFICATIONS_DENIED = 2

const PUSH_UNKNOWN = 0
const PUSH_UNSUBSCRIBED = 1
const PUSH_SUBSCRIBED = 2

// Keep all state in one place.
var state = module.exports = {
  error: ERR_NONE,
  isPushSubscribed: PUSH_UNKNOWN,
  workerStatus: 'not installed'
}

main()

function main () {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    state.error = ERR_UNSUPPORTED_BROWSER
  } else {
    registerServiceWorker()
    console.log('Notification.permission: ' + window.Notification.permission)
    if (window.Notification.permission === 'denied') state.error = ERR_NOTIFICATIONS_DENIED
  }

  updateUI()
}

function registerServiceWorker () {
  console.log('Registering service worker...')

  navigator.serviceWorker.register('bundle.js', {
    scope: './'
  }).then(function (registration) {
    var worker
    if (registration.installing) worker = registration.installing
    else if (registration.waiting) worker = registration.waiting
    else if (registration.active) worker = registration.active
    else return

    state.serviceWorker.worker = worker
    handleWorkerStateChange()
    worker.addEventListener('statechange', handleWorkerStateChange)
  }).catch(function (error) {
    console.error(error)
    state.error = error.message
    updateUI()
  })
}

function handleWorkerStateChange () {
  var worker = state.serviceWorker.worker
  if (worker) state.serviceWorker.status = worker.state
  if (worker && worker.state === 'activated') registerPush(worker)
  updateUI()
}

function updateUI () {
  document.querySelector('#service-worker-status').innerText = state.workerStatus

  if (state.error === ERR_UNSUPPORTED_BROWSER) show('#error-unsupported-browser')
  else if (state.error === ERR_NOTIFICATIONS_DENIED) show('#error-notifications-denied')

  var buttonText = state.isPushSubscribed ? 'unsubscribe' : 'subscribe'
  document.querySelector('#toggle-subscribe').innerText = buttonText
}

function show (selector) {
  document.querySelector(selector).style.display = 'block'
}

function registerPush (worker) {
  if (!worker.showNotification) {
    console.log('ServiceWorker Notifications missing')
  }
  reg.pushManager.getSubscription()
    .then(function(subscription) {
      state.isPushSubscribed = !!subscription

      console.log('Got push subscription: ' + subscription.toJSON())
      var endpoint = subscription.endpoint
      var key = subscription.getKey('p256dh')
      console.log(key)
      updateStatus(endpoint, key, 'init')
    })
}


  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then(function(reg) {
    // Do we already have a push message subscription?
    reg.pushManager.getSubscription()
      .then(function(subscription) {
        // Enable any UI which subscribes / unsubscribes from
        // push messages.

        subBtn.disabled = false;

        if (!subscription) {
          console.log('Not yet subscribed to Push')
          // We aren't subscribed to push, so set UI
          // to allow the user to enable push
          return;
        }

        // Set your UI to show they have subscribed for
        // push messages
        subBtn.textContent = 'Unsubscribe from Push Messaging';
        isPushEnabled = true;

        // initialize status, which includes setting UI elements for subscribed status
        // and updating Subscribers list via push

      })
      .catch(function(err) {
        console.log('Error during getSubscription()', err);
      });

      // set up a message channel to communicate with the SW
      var channel = new MessageChannel();
      channel.port1.onmessage = function(e) {
        console.log(e);
        handleChannelMessage(e.data);
      }

      mySW = reg.active;
      mySW.postMessage('hello', [channel.port2]);
  });
}



function subscribe() {

      subBtn.disabled = true;

      navigator.serviceWorker.ready.then(function(reg) {
        reg.pushManager.subscribe({userVisibleOnly: true})
          .then(function(subscription) {
            // The subscription was successful
            isPushEnabled = true;
            subBtn.textContent = 'Unsubscribe from Push Messaging';
            subBtn.disabled = false;

            // Update status to subscribe current user on server, and to let
            // other users know this user has subscribed
            var endpoint = subscription.endpoint;
            var key = subscription.getKey('p256dh');
            updateStatus(endpoint,key,'subscribe');
          })
          .catch(function(e) {
            if (Notification.permission === 'denied') {
              // The user denied the notification permission which
              // means we failed to subscribe and the user will need
              // to manually change the notification permission to
              // subscribe to push messages
              console.log('Permission for Notifications was denied');

            } else {
              // A problem occurred with the subscription, this can
              // often be down to an issue or lack of the gcm_sender_id
              // and / or gcm_user_visible_only
              console.log('Unable to subscribe to push.', e);
              subBtn.disabled = false;
              subBtn.textContent = 'Subscribe to Push Messaging';
            }
          });
      });
}

function unsubscribe() {
  subBtn.disabled = true;

  navigator.serviceWorker.ready.then(function(reg) {
    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    reg.pushManager.getSubscription().then(
      function(subscription) {

        // Update status to unsubscribe current user from server (remove details)
        // and let other subscribers know they have unsubscribed
        var endpoint = subscription.endpoint;
        var key = subscription.getKey('p256dh');
        updateStatus(endpoint,key,'unsubscribe');

        // Check we have a subscription to unsubscribe
        if (!subscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          isPushEnabled = false;
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe to Push Messaging';
          return;
        }

        isPushEnabled = false;

        // setTimeout used to stop unsubscribe being called before the message
        // has been sent to everyone to tell them that the unsubscription has
        // occurred, including the person unsubscribing. This is a dirty
        // hack, and I'm probably going to hell for writing this.
        setTimeout(function() {
        // We have a subcription, so call unsubscribe on it
        subscription.unsubscribe().then(function(successful) {
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe to Push Messaging';
          isPushEnabled = false;
        }).catch(function(e) {
          // We failed to unsubscribe, this can lead to
          // an unusual state, so may be best to remove
          // the subscription id from your data store and
          // inform the user that you disabled push

          console.log('Unsubscription error: ', e);
          subBtn.disabled = false;
        })
        },3000);
      }).catch(function(e) {
        console.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
  });
}

function postSubscribeObj(statusType, name, endpoint, key) {
    // Create a new XHR and send an array to the server containing
    // the type of the request, the name of the user subscribing,
    // and the push subscription endpoint + key the server needs
    // to send push messages
    var request = new XMLHttpRequest();

    request.open('POST', 'https://127.0.0.1:7000');
    request.setRequestHeader('Content-Type', 'application/json');

    var subscribeObj = {
                         statusType: statusType,
                         name: nameInput.value,
                         endpoint: endpoint,
                         key: btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
                       }
    console.log(subscribeObj);
    request.send(JSON.stringify(subscribeObj));
}

function updateStatus(endpoint,key,statusType) {
    console.log("updateStatus, endpoint: " + endpoint);
    console.log("updateStatus, key: " + key);

  // If we are subscribing to push
  if(statusType === 'subscribe' || statusType === 'init') {
    // Create the input and button to allow sending messages
    sendBtn = document.createElement('button');
    sendInput = document.createElement('input');

    sendBtn.textContent = 'Send Chat Message';
    sendInput.setAttribute('type','text');
    // Append them to the document
    controlsBlock.appendChild(sendBtn);
    controlsBlock.appendChild(sendInput);

    // Set up a listener so that when the Send Chat Message button is clicked,
    // the sendChatMessage() function is fun, which handles sending the message
    sendBtn.onclick = function() {
      sendChatMessage(sendInput.value);
    }

    postSubscribeObj(statusType, name, endpoint, key);

  } else if(statusType === 'unsubscribe') {
    // If we are unsubscribing from push

    // Remove the UI elements we added when we subscribed
    controlsBlock.removeChild(sendBtn);
    controlsBlock.removeChild(sendInput);

    postSubscribeObj(statusType, name, endpoint, key);

  }

}

function handleChannelMessage(data) {
  if(data.action === 'subscribe' || data.action === 'init') {
    var listItem = document.createElement('li');
    listItem.textContent = data.name;
    subscribersList.appendChild(listItem);
  } else if(data.action === 'unsubscribe') {
    for(i = 0; i < subscribersList.children.length; i++) {
      if(subscribersList.children[i].textContent === data.name) {
        subscribersList.children[i].parentNode.removeChild(subscribersList.children[i]);
      }
    }
    nameInput.disabled = false;
  } else if(data.action === 'chatMsg') {
    var listItem = document.createElement('li');
    listItem.textContent = data.name + ": " + data.msg;
    messagesList.appendChild(listItem);
    sendInput.value = '';
  }
}

function sendChatMessage(chatMsg) {
  navigator.serviceWorker.ready.then(function(reg) {
    // Find push message subscription, then retrieve it
    reg.pushManager.getSubscription().then(function(subscription) {
      var endpoint = subscription.endpoint;
      var key = subscription.getKey('p256dh');
      // Create a new XHR and send an object to the server containing
      // the type of the request, the name of the user unsubscribing,
      // and the associated push subscription
      var request = new XMLHttpRequest();

      request.open('POST', 'https://127.0.0.1:7000');
      request.setRequestHeader('Content-Type', 'application/json');

      var messageObj = {
                          statusType: 'chatMsg',
                          name: nameInput.value,
                          msg: chatMsg,
                          endpoint: endpoint,
                          key: btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
                        }
      console.log(messageObj);
      request.send(JSON.stringify(messageObj));
    })
  })
}
