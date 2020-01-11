const socket = io()

const messageForm=document.querySelector('#message-form')
const messageFormInput=document.querySelector('input')
const messageFormButton=document.querySelector('button')
const locationButton=document.querySelector('#send-location')
const messages=document.querySelector('#messages')

// Templates
const messageTemplate=document.querySelector('#message-template').innerHTML

socket.on('message', (message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate, {
        message: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

const locationTemplate=document.querySelector('#location-template').innerHTML

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

// Options
const {username, room}= Qs.parse(location.search,{ignoreQueryPrefix: true})

messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    
    socket.emit('sendMessage', message, (error)=>{
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value=''
        messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click', (e)=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendPosition', {
            Latitude: position.coords.latitude,
            Longitude: position.coords.longitude
        }, (message)=>{
            locationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join',{username, room})