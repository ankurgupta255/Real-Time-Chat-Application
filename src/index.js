const http=require('http')
const express = require('express');
const path = require('path');
const socketio=require('socket.io');
const Filter=require('bad-words')
const  generateMessage = require('./utils/messages')
const generateLocation=require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const app=express();
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicPath=path.join(__dirname, '../public')

app.use(express.json())
app.use(express.static(publicPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket Connection')
    socket.on('join',(options,callback)=>{
        const { error, user } = addUser({ id: socket.id, ...options })
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback('Delivered')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on('sendPosition', (position, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocation(user.username,`https://google.com/maps?q=${position.Latitude},${position.Longitude}`))
        callback('The Location is Delivered!')
    })
})

server.listen(port, ()=>{
    console.log('Server is running on Port ' + port)
})