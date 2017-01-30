/** @jsx h */
const { h, render } = require('preact')

const App = require('../components/App')
const socket = require('./socket')

const state = window.state = {
}

init()

let root
function update () {
  root = render(<App state={state} />, document.body, root)
}

function init () {
  // Allow server to set initial state
  Object.assign(state, window.initialState)
  update()
  if (state.userName) {
    socket.init(state.game, update)
  }
}
