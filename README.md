<h1 align="center">
  <img src="https://cloud.githubusercontent.com/assets/169280/22394697/9da8d3e2-e4db-11e6-8648-4fffd389a5ac.gif" alt="batsignal">
  <br>
  batsignal
  <br>
  <br>
</h1>

**summon your heros. save the city.**

batsignal is a tool for political organizations to send action alerts to supporters.

use this to fill meetings, blow up politicians' phone lines, or have all your supporters call in
to a radio show. use it to bring people to a protest. use it to create action.

batsignal has a strict no-spam rule. never use it to ask for money. there are plenty of existing
ways to do that. alerts should be concise and immediately actionable, and should tell your
supporters exactly what they can do to help.

batsignal doesn't require a sign up. your supporters won't need to enter a phone number or email.
instead, it uses the new **browser push api**.

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
