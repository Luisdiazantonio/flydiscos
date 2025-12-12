let cartas = [
    "😀​", "😀​",
    "🤣​", "🤣​",
    "👍​", "👍​",
    "🇲🇽", "🇲🇽",
    "⚽", "⚽",
    "🐈‍⬛​", "🐈‍⬛​",
    "🤝​", "🤝​",
    "❤️‍🩹​", "❤️‍🩹​",
    "🍎​", "🍎​",
    "✅​", "✅​",
    "​🏁​", "​🏁​",
    "🏆​", "🏆​",
    "👀​", "👀​",
    "❌​", "❌​",
    "💯​", "💯​",
    "​☀️​", "​☀️​"
];
let jugada1 = null;
let jugada2 = null;
let id1 = null;
let id2 = null;
let bloqueado = false;
let nombreJugador = "";
function iniciarJuego() {
    nombreJugador = prompt("¡Bienvenido al Memorama Familiar!\n\n¿Cuál es tu nombre?", "Jugador");
    if (!nombreJugador) nombreJugador = "Jugador";
   
    document.getElementById("nombre-jugador").innerHTML = `¡Hola, <strong>${nombreJugador}</strong>! ¡Encuentra todos los pares!`;
    document.getElementById("juego").style.opacity = 1;
    document.getElementById("mensaje").innerHTML = "";
    barajarCartas();
    resetearTablero();
}
function barajarCartas() {
    for (let i = cartas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }
}
function resetearTablero() {
    for (let i = 0; i < 32; i++) {
        const celda = document.getElementById(i);
        celda.dataset.valor = cartas[i];
        celda.innerHTML = "?";
        celda.classList.remove("volteada", "acertada");
        celda.style.backgroundColor = "";
    }
    jugada1 = jugada2 = id1 = id2 = null;
    bloqueado = false;
}
function girarCarta(id) {
    if (bloqueado) return;
    const celda = document.getElementById(id);
    if (celda.classList.contains("acertada") || celda.classList.contains("volteada")) return;
    celda.classList.add("volteada");
    celda.innerHTML = celda.dataset.valor;
    if (!jugada1) {
        jugada1 = celda.dataset.valor;
        id1 = id;
    } else {
        jugada2 = celda.dataset.valor;
        id2 = id;
        bloqueado = true;
        setTimeout(() => {
            if (jugada1 === jugada2) {
                document.getElementById(id1).classList.add("acertada");
                document.getElementById(id2).classList.add("acertada");
                comprobarVictoria();
            } else {
                document.getElementById(id1).classList.remove("volteada");
                document.getElementById(id2).classList.remove("volteada");
                document.getElementById(id1).innerHTML = "?";
                document.getElementById(id2).innerHTML = "?";
            }
            jugada1 = jugada2 = id1 = id2 = null;
            bloqueado = false;
        }, 800);
    }
}
function comprobarVictoria() {
    setTimeout(() => {
        const acertadas = document.querySelectorAll(".acertada").length;
        if (acertadas === 32) {
            document.getElementById("mensaje").innerHTML =
                `¡FELICIDADES ${nombreJugador.toUpperCase()}!<br>¡GANASTE EL MEMORAMA!`;
        }
    }, 300);
}
function resetearJuego() {
    barajarCartas();
    resetearTablero();
    document.getElementById("mensaje").innerHTML = "";
}