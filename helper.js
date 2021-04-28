let socketUsers = {};

function disconnect() {
    if (socket.id in socketUsers) {
        delete socketUsers[socket.id];
    }
};

function requestJoinGame(user, room) {
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
            return { msg: 'room-full' };
        }
        else if (roomUsernames.includes(user.name)) {
            return { msg: 'taken-username' };
        }
        else {
            socketUsers[socket.id] = user;
            roomUsers.push(user)
            socket.join(room);
            return { msg: 'all-players', data: roomUsers };
        }
    }
    else {
        socketUsers[socket.id] = user;
        socket.join(room);
        roomUsers = [user];
        return { msg: 'all-players', data: roomUsers };
    }
}

function chatMessage(message) {
    const user = socketUsers[socket.id];
    const room = [...socket.rooms].filter(r => r != socket.id)[0];
    return { msg: 'new-chat-message', data: { username: user.name, message: message }, room: room };
}

function quizStart(questions, quiz) {
    const room = [...socket.rooms].filter(r => r != socket.id)[0];
    return { msg: 'quiz-questions', data: { questions, quiz }, room: room };
}

function quizFinished(score) {
    const user = socketUsers[socket.id];
    const room = [...socket.rooms].filter(r => r != socket.id)[0];
    return { msg: 'player-score', data: { username: user.name, score: score }, room: room };
}