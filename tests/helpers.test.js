const { disconnect, requestJoinGame, chatMessage, quizStart, quizFinished } = require('../helper');

describe('requestJoinGame', () => {
    test('it adds a user to a new room', () => {
        const user = {name: "test"};
        const socket = {id: "testId"};
        const roomData = undefined;
        const result = requestJoinGame(user, socket, roomData);
        expect(result.msg).toBe('all-players');
        expect(result.data).toStrictEqual([user]);
    });

    test('it adds a user to an existing room', () => {
        requestJoinGame({name: "existingUser"}, {id: "existingTestId"}, undefined);
        const user = {name: "test"};
        const socket = {id: "testId"};
        const roomData = ["existingTestId"];
        const result = requestJoinGame(user, socket, roomData);
        expect(result.msg).toBe('all-players');
        expect(result.data).toStrictEqual([{name: "existingUser"}, user]);
    });
    
    test('it returns a message if the room is full', () => {
        const user = {name: "test"};
        const socket = {id: "testId"};
        const roomData = new Set(["Test1", "Test2", "Test3", "Test4", "Test5"]);
        for (const data of roomData) {
            requestJoinGame({name: data.id}, {id: data}, undefined);
        }
        const result = requestJoinGame(user, socket, roomData);
        expect(result.msg).toBe('room-full');
    });
    
    test('it returns a message if the username is taken', () => {
        requestJoinGame({name: "takenName"}, {id: "existingTestId"}, undefined);
        const user = {name: "takenName"};
        const socket = {id: "testId"};
        const roomData = ["existingTestId"];
        const result = requestJoinGame(user, socket, roomData);
        expect(result.msg).toBe('taken-username');
    });
});

describe('disconnect', () => {
    test('it deletes a user if they are in the socketUsers object', () => {
        const result = disconnect({id: "testId"});
        expect(result).toBe(true);
    });
    test('it does not delete a user if they are not in the socketUsers object', () => {
        const result = disconnect({id: "notAValidId"});
        expect(result).toBe(false);
    });
});

describe('chatMessage', () => {
    test('it returns an object with the message and username', () => {
        const socket = { rooms: new Set(["testRoom", "testId"]), id: "existingTestId" };
        const message = "testMessage";
        const result = chatMessage(message, socket);
        expect(result.msg).toBe("new-chat-message");
        expect(result.data.message).toBe("testMessage");
        expect(result.data.username).toBe("takenName");
        expect(result.room).toBe("testRoom");
    });
});