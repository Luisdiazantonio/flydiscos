// server.js
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// -----------------------------
//  ESTADO GLOBAL DEL JUEGO
// -----------------------------
let game = {
  message: "Conexión establecida",
  players: {},     // jugadores conectados
  readyCount: 0,   // cuántos marcaron listo
  maxPlayers: 3,   // máximo por partida
  state: "lobby"   // lobby | playing
};

// coneccion de jugadores
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Registrar jugador
  game.players[socket.id] = {
    id: socket.id,
    connected: true,
    ready: false,
  };

  // Enviar actualización inicial del lobby
  io.emit("lobby_update", game.players);

  // jugador listo
  socket.on("player_ready", () => {
    if (!game.players[socket.id].ready) {
      game.players[socket.id].ready = true;
      game.readyCount++;
    }

    io.emit("lobby_update", game.players);

    // limite de jugadores
    if (game.readyCount >= game.maxPlayers) {
      game.state = "playing";
      io.emit("start_game"); 
      console.log("Juego iniciado");
    }
  });

  // Desconectar jugador
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);

    if (game.players[socket.id]?.ready) {
      game.readyCount--;
    }

    delete game.players[socket.id];

    io.emit("lobby_update", game.players);
  });
});

// iniciar server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend listo en puerto ${PORT}`));
