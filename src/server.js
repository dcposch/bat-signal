var express = require('express')
var http = require('http')
var serveStatic = require('serve-static')
var path = require('path')
var webPush = require('web-push')
var fs = require('fs')

var subscribers = []

var app = express()
app.use(serveStatic(path.join(__dirname, '..', 'static'), {'index': ['index.html']}))
app.use(serveStatic(path.join(__dirname, '..', 'build'), {'index': false}))

var keys = null
try {
  keys = JSON.parse(fs.readFileSync('keys.json'))
} catch (e) {
  console.log('warning: couldn\'t read keys.json - run ./scripts/generate-keys.js')
}

app.post('/', function (request, response) {
  var body = ''

  request.on('data', function (chunk) {
    body += chunk
  })

  request.on('end', function () {
    if (!body) return
    var obj = JSON.parse(body)
    console.log('POSTed: ' + obj.statusType)

    if (obj.statusType === 'subscribe') {
      console.log('DBG NEW SUBSCRIPTION ', JSON.stringify(obj, null, 2))
      subscribers.push(obj)
    } else if (obj.statusType === 'unsubscribe') {
      var index = subscribers.findIndex((x) => x.key === obj.key)
      if (index < 0) return console.error('Cannot unsubscribe, cannot find ' + obj.key)
      subscribers = subscribers.splice(index, 1)
    }
  })

  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers'})
  response.end()
})

function notifyAll () {
  var message = {
    title: 'YIMBY Action Alert',
    message: 'The monthly meeting is tonight at 6pm. ' +
      '<a href="https://goo.gl/maps/6nDQRB6VsKB2">661 Natoma</a>. Be there!'
  }
  console.log('Notifying %d subscribers', subscribers.length)
  subscribers.forEach(function (subscriber) {
    notify(subscriber, message)
  })
}

function notify (subscriber, message) {
  webPush.sendNotification(subscriber, JSON.stringify(message))
}

setInterval(notifyAll, 20000)

var server = http.createServer(app)
server.listen(7000, function () {
  console.log('listening on ' + JSON.stringify(server.address()))
})
