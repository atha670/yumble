import games from '../domain/Games';
/**
 * Socket event for when a user disconnects.
 * @param {*} socket
 * @param {*} io
 * @param {*} cb callback function
 */
export function leaveRoom(socket, io, cb = null) {
  socket.on('leave_room', () => {
    const activeGames = games.getGames();

    activeGames.forEach((game) => {
      let users = Array.from(game.session.users.values()).map((e) => e.name);
      // Indicate host has left
      if (game.session.hostSocket && socket.id === game.session.hostSocket.id) {
        game.session.hostSocket = null;
      }
      // Remove users with same socket
      if (game.session.removeUser(socket)) {
        // Recalculate users as have been changed
        users = Array.from(game.session.users.values()).map((e) => e.name);
        io.to(game.session.sessionId).emit('new_user', {users: users});
      }
      // Remove the game if the game hasnt started and no one is in the lobby
      // To prevent a memory leak
      if (!game.session.hostSocket && users.length == 0 && !game.gameActive) {
        games.removeGame(game.session.sessionId);
        console.log('removed game:', game.session.sessionId);
      }
    });
    console.log('user left room with id:', socket.id);
    if (cb) {
      console.log('done is called');
      cb(socket.id);
    }
  });
}
