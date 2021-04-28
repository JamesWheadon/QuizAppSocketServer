const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app);
const socketio = require("socket.io");
const options = {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
};
const io = socketio(server, options);

app.get('/', (req, res) => {
    res.send('Socket is listening');
});

let socketUsers = {};

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('admin-message', 'Hi there, new friend!')
    socket.broadcast.emit('admin-message', `A new friend has arrived!`)

    socket.on('disconnect', () => {
        if (socket.id in socketUsers) {
            delete socketUsers[socket.id];
        }
        console.log('user disconnected');
    });

    socket.on('request-join-game', ({ user, room }) => {
        socketUsers[socket.id] = user;
        socket.join(room)

        const roomData = io.sockets.adapter.rooms.get(room);
        const inRoomCount = roomData.size
        let roomUsers = [];
        for (const user of roomData) {
            roomUsers.push(socketUsers[user])
        }
        io.in(room).emit('all-players',  roomUsers )
        io.in(room).emit('admin-message', `${inRoomCount} players now in ${room}!`)
    })

    socket.on('chat-message', (message) => {
        const username = socketUsers[socket.id].name;
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        io.in(room).emit('new-chat-message', { username: username, message: message });
    })
})

const port = process.env.PORT || 5001;

server.listen(port, () => console.log(`Sockets listening on port ${port}!`))