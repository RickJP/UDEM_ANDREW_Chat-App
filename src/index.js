const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMsg, generateLocMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))



io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  socket.on('join', ({username, room}, cb) => {
    const { err, user } = addUser({ id: socket.id, username, room })

    if (err) {
      return cb(err)
    }

    socket.join(user.room)
    socket.emit('message', generateMsg('Admin',`Welcome`))
    socket.broadcast.to(user.room).emit('message', generateMsg('Admin',`${user.username} has joined.`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    cb()
    // socket.emit (sends to specific client), io.emit (every connected client), socket.broadcat.emit (every client except  this one)
    // io.to.emit (emits an everyone to a specific room), socket.broadcast.to.emit (send event to every client, except for specific client, but limiting it to a specific chat room )
  })




  socket.on('sendMsg', (msg, cb) => {
    const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(msg)) {
      return cb('Don\'t use shitty words!!');
    }
    console.log(msg)
    io.to(user.room).emit('message', generateMsg(user.username, msg))
    cb()
  })

  socket.on('sendLocation', (coords, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMsg', generateLocMsg(user.username,`${coords.lat},${coords.long}`));
    cb()
  })

  socket.on('disconnect', () => {

    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMsg('Admin',`${user.username} has left.`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})


