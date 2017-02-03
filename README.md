<h1 align="center">
  <img src="https://cloud.githubusercontent.com/assets/169280/22394697/9da8d3e2-e4db-11e6-8648-4fffd389a5ac.gif" alt="batsignal">
  <br>
  bat signal
  <br>
  <br>
</h1>

**summon your heros. save the city.**

bat signal is a tool for political organizations to send push notifications to supporters.

use this to pack meetings, blow up politicians' phone lines, comment on a fresh news article, or call in to a radio show. use it to remind people on the morning of a protest. use it only for good.

## quick start

```
npm install
node ./scripts/generate-keys
npm run watch
```

then, in another tab:

```
npm start
```

## deployment

```
npm run build
```

deploy the whole folder excluding `.git` and `node_modules` to a server, then run

```
node src/server.js
```

you'll need your own SSL reverse proxy.
