const http=require('http')
const express = require('express');
const path = require('path');
const socketio=require('socket.io');
const Filter=require('bad-words')

const app=express();
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicPath=path.join(__dirname, '../public')

app.use(express.json())
app.use(express.static(publicPath))

io.on('connection',(socket)=>{
    console.log('New WebSocket Connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')
    
    socket.on('sendMessage', (message, callback)=>{
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', message)
        callback('Delivered')
    })

    socket.on('disconnect',()=>{
        io.emit('message', 'A user has left!')
    })
    socket.on('sendPosition', (position, callback)=>{
        io.emit('locationMessage', `https://google.com/maps?q=${position.Latitude},${position.Longitude}`)
        callback('The Location is Delivered!')
    })
})

server.listen(port, ()=>{
    console.log('Server is running on Port ' + port)
})