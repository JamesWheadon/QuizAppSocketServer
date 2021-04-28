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

let socketUsernames = {};

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('admin-message', 'Hi there, new friend!')
    socket.broadcast.emit('admin-message', `A new friend has arrived!`)

    socket.on('disconnect', () => {
        if (socket.id in socketUsernames) {
            delete socketUsernames[socket.id];
        }
        console.log('user disconnected');
    });

    socket.on('request-join-game', ({ room, username }) => {
        socketUsernames[socket.id] = username;

        const roomData = io.sockets.adapter.rooms.get(room);
        let roomUsernames = [];
        for (const user of roomData) {
            roomUsernames.push(socketUsernames[user]);
        }
        const inRoomCount = roomData.size;
        if (inRoomCount == 5) {
            socket.emit('room-full');
        }
        else if (roomUsernames.contains(username)) {
            socket.emit('taken-username');
        }
        else {
            socket.join(room);
            io.in(room).emit('all-players', roomUsernames);
        }
    })

    socket.on('chat-message', (message) => {
        const username = socketUsernames[socket.id];
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        io.in(room).emit('new-chat-message', { username: username, message: message });
    })

    socket.on('quiz-start', ({questions, quiz}) => {
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        socket.in(room).emit('quiz-questions', {questions, quiz});
    })

    socket.on('quiz-finished', (score) => {
        const username = socketUsernames[socket.id];
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        io.in(room).emit('player-score', { username: username, score: score });
    })
})

const port = process.env.PORT || 5001;

server.listen(port, () => console.log(`Sockets listening on port ${port}!`))