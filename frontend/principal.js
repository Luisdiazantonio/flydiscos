//principal.js
// const socket = io("https://tu-backend.up.railway.app");
const socket = io("http://192.168.0.254:3001");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let state = null;

socket.on("state", (gameState) => {
  state = gameState;

  
  if (canvas.style.display !== "none") {
    draw();
  }
});

//contenedor para interfaces

const appContainer = document.createElement("div");
appContainer.id = "app";
document.body.appendChild(appContainer);

//cargar interfaces
async function loadInterface(name) {
  try {
    const res = await fetch(`./games/${name}.html`);
    const html = await res.text();
    appContainer.innerHTML = html;
  } catch (err) {
    console.error("Error cargando interfaz:", name, err);
  }
}


window.onload = () => {
  loadInterface("menu");
};