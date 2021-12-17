const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', (socket)=>{
    let msg = "Welcome"
    console.log(`New WebSocket Connection- ${socket.id}`);

    socket.on("join", (options, callback)=>{
        const {error, user} = addUser({id: socket.id, ...options});

        if(error){
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage(msg,'Admin'));

        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the Group`,'Admin'));

        // Sending Information Who all users are there in the corresponding room
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })



        callback();
    });


    socket.on('sendMessage', (msg, callback)=>{
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('Profanity Not Allowed');
        }
        if(user=== undefined){
            return callback('User Not Found')
        }
        io.to(user.room).emit('message', generateMessage(msg, user.username));
        callback();
    });


    socket.on('geolocation', (position, callback)=>{
        const user = getUser(socket.id);
        if(user===undefined){
            return callback('User Not Found');
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://www.google.com/maps?q=${position.latitude},${position.longitude}`, user.username));
        callback();
    });
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage( `${user.username} has left the group`, 'Admin'));
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            });
        }
    });
});


server.listen(port, () => {
    console.log(`Server is on port ${port}!`);
});
 