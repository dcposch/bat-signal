/** @jsx h */
const { Component, h } = require('preact')

class Sheet extends Component {
  render (props) {
    return (
      <div className='measure lh-copy'>
        {props.children}
      </div>
    )
  }
}

module.exports = Sheet
