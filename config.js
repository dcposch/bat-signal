const isProd = typeof window !== 'undefined'
  ? window.location.hostname !== 'localhost'
  : process.env.NODE_ENV === 'production'

/**
 * Is site running in production?
 */
exports.isProd = isProd

/**
 * Server listening port
 */
exports.port = isProd
  ? 7500
  : 4000

/**
 * Name of the site
 */
exports.name = 'Bat Signal'

/**
 * Description of the site
 */
exports.description = 'Summon your heros. Save the city.'

/**
 * Website hostname
 */
exports.host = isProd
  ? 'www.batsign.al'
  : 'localhost:' + exports.port

/**
 * HTTP origin
 */
exports.httpOrigin = (isProd ? 'https' : 'http') + '://' + exports.host

/**
 * Websocket origin
 */
exports.wsOrigin = (isProd ? 'wss' : 'ws') + '://' + exports.host

/**
 * Root path of project
 */
exports.root = __dirname
