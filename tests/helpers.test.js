const { disconnect, requestJoinGame, chatMessage, quizStart, quizFinished } = require('../helper');

describe('requestJoinGame', () => {
    test('it adds a user to a new room', () => {
        const user = {username: "test"};
        const socket = {id: "testId"};
        const roomData = undefined;
        const result = requestJoinGame(user, socket, roomData);
        expect(result.msg).toBe('all-players');
        expect(result.data).toStrictEqual([user]);
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