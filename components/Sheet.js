/** @jsx h */
const { Component, h } = require('preact')

class Sheet extends Component {
  render (props) {
    return (
      <div class='mh2 ph4 pv4 br3 bg-white'>
        {props.children}
      </div>
    )
  }
}

module.exports = Sheet
