// principal.js

// const socket = io("https://tu-backend.up.railway.app");
const socket = io("http://192.168.0.254:3001");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Estado del juego
let state = null;

// recibir estado
socket.on("state", (gameState) => {
  state = gameState;

  if (canvas.style.display !== "none") {
    draw();
  }
});

// contenedores para despliege
const appContainer = document.createElement("div");
appContainer.id = "app";
document.body.appendChild(appContainer);

//cargar archivos dinamicos
async function loadInterface(name) {
  try {
    const res = await fetch(`./games/${name}/${name}.html`);
    const html = await res.text();
    appContainer.innerHTML = html;
  } catch (err) {
    console.error("Error cargando interfaz:", name, err);
  }
}

// Despliegue de menu
window.onload = () => {
  loadInterface("menu");
  canvas.style.display = "none";
};

// Rederigir a lobby
window.showLobby = function () {
  loadInterface("lobby");
  canvas.style.display = "none";
};

// Botón del lobby → ESTOY LISTO
window.setReady = function () {
  socket.emit("player_ready");
};

// Mostrar jugadores del lobby
socket.on("lobby_update", (players) => {
  const box = document.getElementById("players_box");
  if (!box) return;

  box.innerHTML = "";

  Object.values(players).forEach(p => {
    box.innerHTML += `
      <p>Jugador ${p.id.slice(0, 5)} - ${p.ready ? "Listo" : ""}</p>
    `;
  });
});

// Iniciar juego cuando backend avise
socket.on("start_game", () => {
  loadInterface("game");
  canvas.style.display = "block";
});
