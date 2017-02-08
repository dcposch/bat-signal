module.exports = {
  init
}

const compress = require('compression')
const express = require('express')
const http = require('http')
const LoginTwitter = require('login-with-twitter')
const path = require('path')
const session = require('express-session')
const url = require('url')

const config = require('../config')
const secret = require('../secret')
const pushServer = require('./server')

const loginTwitter = new LoginTwitter(Object.assign({
  callbackUrl: `${config.httpOrigin}/auth/twitter/callback`
}, secret.twitter))

function init (server, sessionStore) {
  const app = express()

  // Trust the nginx reverse proxy
  app.set('trust proxy', true)

  app.use(compress())

  // Add headers
  app.use((req, res, next) => {
    const extname = path.extname(url.parse(req.url).pathname)

    // Add cross-domain header for fonts, required by spec, Firefox, and IE.
    if (['.eot', '.ttf', '.otf', '.woff', '.woff2'].indexOf(extname) >= 0) {
      res.header('Access-Control-Allow-Origin', '*')
    }

    // Prevents IE and Chrome from MIME-sniffing a response to reduce exposure to
    // drive-by download attacks when serving user uploaded content.
    res.header('X-Content-Type-Options', 'nosniff')

    // Prevent rendering of site within a frame
    res.header('X-Frame-Options', 'DENY')

    // Enable the XSS filter built into most recent web browsers. It's usually
    // enabled by default anyway, so role of this headers is to re-enable for this
    // particular website if it was disabled by the user.
    res.header('X-XSS-Protection', '1; mode=block')

    // Force IE to use latest rendering engine or Chrome Frame
    res.header('X-UA-Compatible', 'IE=Edge,chrome=1')

    next()
  })

  app.use(express.static(path.join(config.root, 'static')))
  app.use(express.static(path.dirname(require.resolve('tachyons'))))

  app.use(session({
    store: sessionStore,
    secret: secret.cookie,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: 'auto'
    }
  }))

  app.use((req, res, next) => {
    res.locals.state = {}
    res.locals.state.userName = req.session.user && req.session.user.userName
    next()
  })

  app.get('/auth/twitter', (req, res, next) => {
    if (req.session.user) {
      // Redirect logged-in users to the homepage
      return res.redirect('/')
    }

    loginTwitter.login((err, tokenSecret, url) => {
      if (err) return next(err)

      // Save token secret in the session object
      req.session.tokenSecret = tokenSecret

      // Redirect to Twitter authorization page
      res.redirect(url)
    })
  })

  app.get('/auth/twitter/callback', (req, res, next) => {
    if (req.session.user) {
      // Redirect logged-in users to the homepage
      return res.redirect('/')
    }

    loginTwitter.callback(req.query, req.session.tokenSecret, (err, user) => {
      if (err) return next(err)

      // Delete the saved token secret
      delete req.session.tokenSecret

      // Save the user object in the session object
      req.session.user = user

      // Redirect user to the homepage
      res.redirect('/')
    })
  })

  app.get('/auth/twitter/logout', (req, res) => {
    // Delete the user object from the session
    delete req.session.user

    // Redirect the user to the homepage
    res.redirect('/')
  })

  app.get('/500', (req, res, next) => {
    next(new Error('Manually visited /500'))
  })

  app.get('*', (req, res) => {
    res.locals.state.error = `404: ${http.STATUS_CODES[404]}`
    res.end(404)
  })

  // TODO
  pushServer.init(app)

  app.use((err, req, res, next) => {
    console.error(err.stack || err.message)
    const code = err.status || 500
    res.locals.state.error = `${code}: ${http.STATUS_CODES[code]} (${err.message})`
    res.end(code)
  })

  server.on('request', app)
}
