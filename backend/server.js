import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// estableciendo coneccion
let game = {
  message: "Conexión establecida",
  time: Date.now(),
  players: {}
};

// Evento de conexión
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Registrar jugador
  game.players[socket.id] = { connected: true };

  // Mandar estado inicial
  socket.emit("state", game);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
    delete game.players[socket.id];
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend listo en puerto ${PORT}`));
