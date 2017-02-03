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
exports.port = 6660

/**
 * Name of the site
 */
exports.name = 'batsignal'

/**
 * Description of the site
 */
exports.description = 'summon your heros. save the city.'

/**
 * Website hostname
 */
exports.host = isProd
  ? 'batsign.al'
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
