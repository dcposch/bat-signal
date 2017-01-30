var webPush = require('web-push')
var fs = require('fs')
var URLSafeBase64 = require('urlsafe-base64')

console.log('generating VAPID key pair')
var keys = webPush.generateVAPIDKeys()

console.log('writing keys.json and public-key.dat')
fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2))
fs.writeFileSync('public-key.dat', URLSafeBase64.decode(keys.publicKey))

console.log('done')
