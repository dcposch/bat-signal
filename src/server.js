var express = require('express')
var fs = require('fs')
var http = require('http')
var serveStatic = require('serve-static')
var path = require('path')
var webPush = require('web-push')

var subscribers = []

var app = express()
app.use(serveStatic(path.join(__dirname, '..', 'static'), {'index': ['index.html']}))
app.use(serveStatic(path.join(__dirname, '..', 'build'), {'index': false}))

app.post('/', function (request, response) {
  var body = ''

  request.on('data', function (chunk) {
    body += chunk
  })

  request.on('end', function () {
    if (!body) return
    var obj = JSON.parse(body)
    console.log('POSTed: ' + obj.statusType)

    if (obj.statusType === 'chatMsg') {
      subscribers.forEach(function (subscriber) {
        webPush.sendNotification(subscriber.endpoint, 200, obj.key, JSON.stringify({
          action: 'chatMsg',
          name: obj.name,
          msg: obj.msg
        }))
      })
    } else if (obj.statusType === 'init') {
      subscribers.forEach(function (subscriber) {
        webPush.sendNotification(subscriber.endpoint, 200, obj.key, JSON.stringify({
          action: 'init',
          name: subscriber.name
        }))
      })
    } else if (obj.statusType === 'subscribe') {
      subscribers.push(obj)
    } else if (obj.statusType === 'unsubscribe') {
      var index = subscribers.findIndex((x) => x.name === obj.name)
      if (index < 0) return console.error('Cannot unsubscribe, cannot find ' + obj.name)
      subscribers = subscribers.splice(index, 1)
    }
  })

  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers'})
  response.end()
})

var server = http.createServer(app)
server.listen(7000, function () {
  console.log('listening on ' + JSON.stringify(server.address()))
})
