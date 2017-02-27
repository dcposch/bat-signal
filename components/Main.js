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
          <h1 align='center'>
            <img src='batsignal.gif' alt='batsignal' />
            <br />
            batsignal
            <br />
            <br />
          </h1>

          <h2>summon your heros. save the city.</h2>

          <h2>just a test</h2>

          <p>
            <strong>service worker: </strong>
            <span id='service-worker-status' />
          </p>

          <p>
            <strong>push notifications: <button id='toggle-subscribe' /></strong>
          </p>

          <p>
            clicking Subscribe will ask to show notifications. click allow. 10 seconds later, even
            if you've closed the tab, everyone who is subscribed will get a demo push notification.
          </p>

          <p>
            batsignal is a tool for political organizations. it lets you send your supporters
            immediately actionable push notifications.
          </p>

          <p>
            no phone number or email required. your supporters will not have to create an account.
            batsignal uses your browser's built-in Push API.
          </p>

          <h2>the rules</h2>

          <ul>
            <li>
              <p><strong>apply sparingly</strong>. nobody likes spam.</p>
            </li>
            <li>
              <p>
                <strong>keep it actionable</strong>. tell me where to be and when. if there's going
                to be public commentary, summarize the issue and give me talking points. if i'm
                calling a representative, a senator, a radio show: same thing.
              </p>
            </li>
            <li>
              <p>
                <strong>keep it immediate</strong>. when my push notification shows up, it should
                ideally be something i can do right now. at the latest, it should be something i can
                do later today.
              </p>
            </li>
          </ul>

          <h2>how it works</h2>

          <ol>
            <li>
              <p>send your supporters a link to your batsignal</p>
            </li>
            <li>
              <p>they sign up for notifications</p>
            </li>
            <li>
              <p>when things are about to go down, activate your signal</p>
            </li>
          </ol>

          <h2>get started</h2>
          <Button
            pill
            fill
            size='l'
            href='/auth/twitter'
            class='mb2'
          >
            Login with Twitter
          </Button>
        </Sheet>
      )
    }

    return <main id='main' className='border-box w-100 mw8 pa2 center'>{$content}</main>
  }
}

module.exports = Main
