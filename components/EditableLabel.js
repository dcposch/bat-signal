/** @jsx h */
const {Component, h} = require('preact')

/**
 * Shows a label with an edit button.
 * When clicked, turns into a text box with a save button.
 */
class EditableLabel extends Component {
  constructor ({text, onSave}) {
    super({text, onSave})

    this.handleEdit = this.handleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)

    this.state = {
      isEditing: false
    }
  }

  componentDidMount () {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  render () {
    if (this.state.isEditing) return this.renderInput()
    else return this.renderLabel()
  }

  renderLabel () {
    const {text} = this.props
    return (
      <div className='h3 cf'>
        <label className='f2'>
          {text}
        </label>
        <a href='#' className='fr f4 ph3 pv1 link ba accent' onClick={this.handleEdit}>
          edit
        </a>
      </div>
    )
  }

  renderInput () {
    const {text} = this.props
    return (
      <div className='h3 cf'>
        <input
          className='w-two-thirds lh-copy f4 ph3 pv1 ba'
          value={text}
          ref={(input) => { this.input = input }}
        />
        <a href='#' className='fr f5 pl3 pt2 link accent' onClick={this.handleCancel}>
          cancel
        </a>
        <a href='#' className='fr f4 ph3 pv1 link ba accent' onClick={this.handleSave}>
          save
        </a>
      </div>
    )
  }

  handleKeyDown (e) {
    if (!this.state.isEditing) return
    if (e.keyCode === 13) this.handleSave()
    if (e.keyCode === 27) this.handleCancel()
  }

  handleEdit () {
    this.setState({isEditing: true})
  }

  handleSave () {
    this.setState({isEditing: false})
    this.props.onSave(this.input.value)
  }

  handleCancel () {
    this.setState({isEditing: false})
  }
}

module.exports = EditableLabel
