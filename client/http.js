module.exports = {get, post}

function get (url, callback) {
  var xhr = new window.XMLHttpRequest()
  handleEvents(xhr, callback)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}

function post (url, data, callback) {
  var xhr = new window.XMLHttpRequest()
  handleEvents(xhr, callback)
  xhr.open('POST', url)
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  xhr.send(JSON.stringify(data))
}

function handleEvents (xhr, callback) {
  xhr.onload = function () {
    if (xhr.status === 200) callback(null, xhr.response)
    else callback(new Error(xhr.status + ': ' + xhr.statusText))
  }
  xhr.onerror = function (errorEvent) {
    callback(errorEvent)
  }
}
