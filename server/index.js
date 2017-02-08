const ConnectSQLite = require('connect-sqlite3')
const debug = require('debug')('batsignal')
const http = require('http')
const path = require('path')
const session = require('express-session')
const mkdirp = require('mkdirp')

const app = require('./app')
const config = require('../config')
const socket = require('./socket')

const server = http.createServer()

const dbDir = path.join(config.root, 'db')
mkdirp.sync(dbDir)
const SQLiteStore = ConnectSQLite(session)
const sessionStore = new SQLiteStore({ dir: dbDir })

app.init(server, sessionStore)
socket.init(server, sessionStore)

server.listen(config.port, onListening)

function onListening (err) {
  if (err) throw err
  debug('Listening on port %s', server.address().port)
}
