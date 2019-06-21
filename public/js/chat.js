const socket = io()

// Elements
const $msgForm = document.querySelector('#msg-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormBtn = $msgForm.querySelector('button')

const $sendLocBtn = document.querySelector('#send-loc');
const $messages = document.querySelector('#messages')

// Templates
const msgTemplate = document.querySelector('#message-template').innerHTML
const locMsgTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
  // New message element
  console.log('Autoscroll')
  const $newMsg = $messages.lastElementChild;

  // Get height of new message
  const newMsgStyles = getComputedStyle($newMsg);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom)
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;

  // Get visible height
  const visibleHeight = $messages.offsetHeight

  // Get height of messages container
  const containerHeight = $messages.scrollHeight

  // How far has the user scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMsgHeight <= scrollOffset) {
    console.log('SCROOOOOOOOl');
    $messages.scrollTop = $messages.scrollHeight;
  }


}

socket.on('message', (msg) => {
  const html = Mustache.render(msgTemplate, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMsg', (msg) => {
  const html = Mustache.render(locMsgTemplate, {
    username: msg.username,
    mapsUrl: msg.url,
    createdAt: moment(msg.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room, users
  })
  document.querySelector('#sidebar').innerHTML = html;
})

// Listens for click on send message button
$msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // disable the form
  $msgFormBtn.setAttribute('disabled', 'disabled');

  const msg = e.target.elements.msg.value;

  socket.emit('sendMsg', msg, (err) => {
    $msgFormBtn.removeAttribute('disabled');
    $msgFormInput.value = ''
    $msgFormInput.focus()
    // enable it
    if (err) {
      return console.log(err)
    }
    console.log('Message Delivered')
  })
})

$sendLocBtn.addEventListener('click', () => {
  
  if (!navigator.geolocation) {
    return alert('Your browser does not support sending location.')
  }
  $sendLocBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit('sendLocation', {
      lat: pos.coords.latitude,
      long: pos.coords.longitude
    }, () => {
      console.log('Location shared')
      $sendLocBtn.removeAttribute('disabled')
    })    
  })
})

socket.emit('join', { username, room }, (err) => {
  if (err) {
    alert(error)
    location.href = '/'
  }
})
