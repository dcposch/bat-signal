/** @jsx h */
const { Component, h } = require('preact')
const http = require('../client/http')
const EditableLabel = require('./EditableLabel')

class OrgPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      signals: [],
      selectedSignal: null
    }
  }

  componentWillMount () {
    http.get('/api/signals', (err, signals) => {
      if (err) throw new Error(err)
      const selectedSignal = signals[0]
      this.setState({signals, selectedSignal})
    })
  }

  render () {
    return (
      <div className='cf lh-copy'>
        <div className='fl w-100 w-25-l'>
          {this.renderSignalList()}
        </div>
        <div className='fl w-100 w-75-l'>
          {this.renderSelectedSignal()}
        </div>
      </div>
    )
  }

  renderSignalList () {
    const {signals, selectedSignal} = this.state

    return signals.map((signal) => (
      <div
        className='h3 pv2 bb b--light-gray pointer'
        onClick={() => this.setState({selectedSignal: signal})}
        style={{
          borderRight: signal === selectedSignal ? '0.5rem solid #514' : ''
        }}
      >
        <div className='f4'>{signal.name}</div>
        <div className='dib f6 w4'>{signal.stats.subscribers} subscribers</div>
        <div className='dib f6'>{signal.stats.alerts} alerts</div>
      </div>
    ))
  }

  renderSelectedSignal () {
    const sig = this.state.selectedSignal

    if (!sig) {
      return (
        <div className='pv4 tc'>create a signal by clicking the plus sign</div>
      )
    }

    return (
      <div className='ml4'>
        <EditableLabel
          text={sig.name}
          onSave={(name) => {
            sig.name = name
            this.setState({selectedSignal: sig})
          }}
        />

        <img src='img/batsignal-sfyimby.gif' className='w-100' />

      </div>
    )
  }
}

module.exports = OrgPage
