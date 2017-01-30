/** @jsx h */
const { Component, h } = require('preact')

class Link extends Component {
  render (props) {
    return (
      <a href={props.href} class='blue hover-light-blue link'>
        {props.children}
      </a>
    )
  }
}

module.exports = Link
