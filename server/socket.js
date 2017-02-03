module.exports = {
  init
}

const CookieParser = require('cookie-parser')
const debug = require('debug')('bat-signal:socket')
const ws = require('ws')

const secret = require('../secret')

const cookieParser = CookieParser(secret.cookie)

function init (server, sessionStore) {
  const wsServer = new ws.Server({ server })
  wsServer.on('connection', onConnection)

  function onConnection (conn) {
    setup()

    function setup () {
      conn.once('error', onError)
      conn.once('close', onClose)
      conn.on('message', onMessage)

      cookieParser(conn.upgradeReq, null, (err) => {
        if (err) return destroy(new Error('Cannot parse cookie'))

        const sessionId = conn.upgradeReq.signedCookies['connect.sid']
        sessionStore.get(sessionId, (err, sess) => {
          if (err) {
            return destroy(new Error('Cannot get session'))
          }
          console.log(sess)
          if (!sess.user || !sess.user.userName) {
            return destroy(new Error('Session lacks user'))
          }

          console.log(sess.user.userName, sess.user)

          conn.user = sess.user
          send({ type: 'ready' })
        })
      })
    }

    function send (message) {
      debug('send: %o', message)
      conn.send(JSON.stringify(message), (err) => {
        if (err) debug('error sending: %s', err.message)
      })
    }

    function destroy (err) {
      if (err) {
        send({ type: 'error', message: err.message }, () => {
          conn.close()
          onClose()
        })
      }
    }

    function onError (err) {
      console.error(err.stack)
    }

    function onClose () {
      conn.removeListener('error', onError)
      conn.removeListener('close', onClose)
      conn.removeListener('message', onMessage)
    }

    function onMessage (message) {
      try {
        message = JSON.parse(message)
      } catch (err) {
        console.error('Ignoring invalid message: ' + message)
      }
      debug('receive: %o', message)

      if (message.type === 'want-peer') {
        //
      }
    }
  }
}
