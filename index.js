const express = require('express');
const app = express();
const http = require("http")
const server = http.createServer(app);
const socketio = require("socket.io");

const { disconnect, requestJoinGame, chatMessage, quizStart, quizFinished } = require('./helper');

const options = {
    cors: {
        origin: "http://localhost:8080"
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
        const joinData = requestJoinGame(user, socket, roomData);
        console.log(joinData)
        if (joinData.data) {
            socket.join(room);
            io.in(room).emit(joinData.msg, joinData.data)
        } else {
            socket.emit(joinData.msg);
        }
    })

    socket.on('chat-message', (message) => {
        const messageData = chatMessage(message, socket);
        console.log(messageData);
        io.in(messageData.room).emit(messageData.msg, messageData.data);
    })

    socket.on('quiz-start', ({ questions, quiz }) => {
        const startData = quizStart(socket);
        console.log(startData);
        socket.in(startData.room).emit(startData.msg, { questions, quiz });
    })

    socket.on('quiz-finished', (user) => {
        const finishedData = quizFinished(user, socket);
        console.log(finishedData);
        io.in(finishedData.room).emit(finishedData.msg, finishedData.data);
    })
})

const port = process.env.PORT || 5001;

server.listen(port, () => console.log(`Sockets listening on port ${port}!`))