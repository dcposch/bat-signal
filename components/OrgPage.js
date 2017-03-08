/** @jsx h */
const { Component, h } = require('preact')
const http = require('../client/http')

class OrgPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      signals: [],
      selectedSignal: null
    }
  }

  componentWillMount () {
    // TODO: load signals
  }

  render () {
    window.DBG = {http}
    return (
      <div>
        <div>
          signal list sidebar
        </div>
        <div>
          signal details
        </div>
      </div>
    )
  }
}

module.exports = OrgPage
