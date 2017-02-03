const ConnectSQLite = require('connect-sqlite3')
const debug = require('debug')('bat-signal')
const http = require('http')
const path = require('path')
const session = require('express-session')

const app = require('./app')
const config = require('../config')
const socket = require('./socket')

const server = http.createServer()

const SQLiteStore = ConnectSQLite(session)
const sessionStore = new SQLiteStore({ dir: path.join(config.root, 'db') })

app.init(server, sessionStore)
socket.init(server, sessionStore)

server.listen(config.port, onListening)

function onListening (err) {
  if (err) throw err
  debug('Listening on port %s', server.address().port)
}
