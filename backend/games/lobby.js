module.exports = function lobbyListener(io, socket, gameManager) {

    socket.on("player_ready", (roomId) => {
        gameManager.setReady(roomId, socket.id);

        io.to(roomId).emit("lobby_update", gameManager.rooms[roomId].players);

        const room = gameManager.rooms[roomId];

        if (room && gameManager.isFull(roomId) && gameManager.areAllReady(roomId)) {
            io.to(roomId).emit("start_game");
            room.state = "started";
        }
    });

};
