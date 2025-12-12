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
    // limpiar datos
    document.querySelectorAll('[data-interface]').forEach(el => el.remove());

    // cargar html
    const htmlRes = await fetch(`./games/${name}/${name}.html`);
    if (!htmlRes.ok) throw new Error(`HTML no encontrado: ${name}`);
    const html = await htmlRes.text();
    appContainer.innerHTML = html;

    // cargar css
    try {
      const cssRes = await fetch(`./games/${name}/${name}.css`);
      if (cssRes.ok) {
        const style = document.createElement('style');
        style.dataset.interface = name;         
        style.textContent = await cssRes.text();
        document.head.appendChild(style);
      }
    } catch (_) {}

    // cargar javaScrip
    try {
      const jsRes = await fetch(`./games/${name}/${name}.js`);
      if (jsRes.ok) {
        const scriptText = await jsRes.text();

        const script = document.createElement('script');
        script.dataset.interface = name;          
        script.textContent = scriptText;
        document.body.appendChild(script);

      }
    } catch (_) {}

  } catch (err) {
    console.error("Error cargando interfaz:", name, err);
    appContainer.innerHTML = `<h2 style="color:red;text-align:center;">Error cargando ${name}</h2>`;
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

// Botón del lobby → Listo
window.setReady = function () {
  socket.emit("player_ready");
};

// Botón del lobby → Dejar sala
window.setexit = function () {
  socket.emit("player_ready");
  loadInterface("menu");
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
