const ConnectSQLite = require('connect-sqlite3')
const debug = require('debug')('batsignal')
const http = require('http')
const path = require('path')
const session = require('express-session')
const mkdirp = require('mkdirp')

const app = require('./app')
const config = require('../config')
const socket = require('./socket')

// Connect to SQLite. Create DB stores.
const dbDir = path.join(config.root, 'db')
debug('Connecting to SQLite: %s', dbDir)
mkdirp.sync(dbDir)
const SQLiteStore = ConnectSQLite(session)
const sessionStore = new SQLiteStore({ dir: dbDir })

// Create a local HTTP server. Serve static files and APIs.
// Expects a seperate reverse proxy listen publically, terminate SSL.
const server = http.createServer()
app.init(server, sessionStore)
socket.init(server, sessionStore)

server.listen(config.port, onListening)

function onListening (err) {
  if (err) throw err
  debug('Serving HTTP on port %s', server.address().port)
}
