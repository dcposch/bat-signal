/** @jsx h **/
const {Component, h} = require('preact')

class Error extends Component {
  render (props) {
    const {errorID} = props

    let $err
    if (errorID === 'error-unsupported-browser') $err = this.renderErrorUnsupportedBrowser()
    else if (errorID === 'error-notifications-denied') $err = this.renderNotificationsDenied()
    else if (errorID === 'error-push-subscribe-failed') $err = this.renderPushSubscribeFailed()
    else throw new Error('Unsupported errorID ' + errorID)

    return (<div class='error'>{$err}</div>)
  }

  renderErrorUnsupportedBrowser () {
    return (
      <div>
        sorry, your browser doesn't support push notifications.
        consider getting the latest <a href='https://www.google.com/chrome/browser'>Chrome</a>
        or <a href='https://www.mozilla.org/en-US/firefox/products/'>Firefox</a>.
      </div>
    )
  }

  renderErrorNotificationsDenied () {
    return (
      <div id='error-notifications-denied'>
        for batsignal to work, please enable notifications. click on the green lock in the
        address bar, then set notifications to Allow.
      </div>
    )
  }

  renderPushSubscribeFailed () {
    return (
      <div id='error-push-subscription-failed'>
        push subscription failed. refresh and try again?
      </div>
    )
  }
}

module.exports = Error
