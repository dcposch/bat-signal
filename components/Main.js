/** @jsx h */
const { Component, h } = require('preact')

const Button = require('./Button')
const Sheet = require('./Sheet')

class Main extends Component {
  render (props) {
    const { error, userName } = props.state

    let $content
    if (error) {
      $content = (
        <Sheet>
          <h1>{error}</h1>
          <h2>Sorry about that.</h2>
        </Sheet>
      )
    } else if (userName) {
      $content = (
        <Sheet>
          <h1>Logged in as {userName}</h1>
        </Sheet>
      )
    } else {
      $content = (
        <Sheet>
          <h1 class='f1'>Summon your heros. Save the city.</h1>
          <Button
            pill
            fill
            size='l'
            href='/auth/twitter'
            class='mb2'
          >
            Login with Twitter
          </Button>
          <p>Organizers, you must login to create a Group. The heroes you summon won't need to login.</p>
        </Sheet>
      )
    }

    return <main id='main' class='mw8 mt3 ma-100 center tc'>{$content}</main>
  }
}

module.exports = Main
