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

    socket.on('disconnect', () => {
        if (socket.id in socketUsers) {
            delete socketUsers[socket.id];
        }
    });

    socket.on('request-join-game', ({ user, room }) => {
        console.log(room, user)
        const roomData = io.sockets.adapter.rooms.get(room);
        let roomUsers = [];
        if (roomData) {
            let roomUsernames = [];
            for (const user of roomData) {
                roomUsers.push(socketUsers[user])
                roomUsernames.push(socketUsers[user].name);
            }
            const inRoomCount = roomData.size;
            if (inRoomCount == 5) {
                socket.emit('room-full');
            }
            else if (roomUsernames.includes(user.name)) {
                socket.emit('taken-username');
            }
            else {
                socketUsers[socket.id] = user;
                roomUsers.push(user)
                socket.join(room);
                io.in(room).emit('all-players', roomUsers);
            }
        }
        else {
            socketUsers[socket.id] = user;
            socket.join(room);
            roomUsers = [user];
            io.in(room).emit('all-players', roomUsers);
        }
    })

    socket.on('chat-message', (message) => {
        const user = socketUsers[socket.id];
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        io.in(room).emit('new-chat-message', { username: user.name, message: message });
    })

    socket.on('quiz-start', ({ questions, quiz }) => {
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        socket.in(room).emit('quiz-questions', { questions, quiz });
    })

    socket.on('finish-quiz', () => {
        const user = socketUsers[socket.id];
        const room = [...socket.rooms].filter(r => r != socket.id)[0];
        io.in(room).emit('player-done', user);
    })
})

const port = process.env.PORT || 5001;

server.listen(port, () => console.log(`Sockets listening on port ${port}!`))