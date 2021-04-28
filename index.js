const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app);
const socketio = require("socket.io");

import { disconnect, requestJoinGame, chatMessage, quizStart, quizFinished } from './helper';

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

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        disconnect(socket)
    });

    socket.on('request-join-game', ({ user, room }) => {
        const roomData = io.sockets.adapter.rooms.get(room);
        const joinData = requestJoinGame(user, room, roomData);
        if (joinData.data) {
            socket.join(room);
            io.in(room).emit(joinData.msg, joinData.data)
        } else {
            socket.emit(joinData.msg);
        }
    })

    socket.on('chat-message', (message) => {
        const messageData = chatMessage(message, socket);
        io.in(messageData.room).emit(messageData.msg, messageData.data);
    })

    socket.on('quiz-start', ({ questions, quiz }) => {
        const startData = quizStart(questions, quiz, socket);
        socket.in(startData.room).emit(startData.msg, startData.msg);
    })

    socket.on('quiz-finished', (score) => {
        const finishedData = quizFinished(score, socket);
        io.in(finishedData.room).emit(finishedData.msg, finishedData.data);
    })
})

const port = process.env.PORT || 5001;

server.listen(port, () => console.log(`Sockets listening on port ${port}!`))

module.exports = { io, server, options };