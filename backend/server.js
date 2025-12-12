// server.js
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Necesario para rutas absolutas en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());


app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// -----------------------------
//  ESTADO GLOBAL DEL JUEGO
// -----------------------------
let game = {
  message: "Conexión establecida",
  players: {},     // jugadores conectados
  readyCount: 0,   // cuántos marcaron listo
  maxPlayers: 2,   // máximo por partida
  state: "lobby"   // lobby | playing
};

// coneccion de jugadores
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  const playerNumber = Object.keys(game.players).length + 1;
  const playerName = playerNumber <= 2 ? `Player ${playerNumber}` : `Player ${playerNumber}`;

  game.players[socket.id] = {
    id: socket.id,
    name: playerName,        
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
  // jugador salir
  socket.on("leave_room", () => {
    console.log("Jugador salió voluntariamente:", socket.id);

    // Si estaba listo, restamos del contador
    if (game.players[socket.id]?.ready) {
      game.readyCount = Math.max(0, game.readyCount - 1);
    }

    // Eliminamos al jugador
    delete game.players[socket.id];

    // Actualizamos el lobby para todos
    io.emit("lobby_update", game.players);
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
