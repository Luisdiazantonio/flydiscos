// --- VARIABLES ---
let posiciones = [1, 1]; // Jugador 1 y Jugador 2
let turno = 0; // 0 = Jugador 1, 1 = Jugador 2
const totalCasillas = 40;

// --- INICIALIZAR TABLERO ---
const camino = document.getElementById("camino");

for (let i = 1; i <= totalCasillas; i++) {
    const div = document.createElement("div");
    div.classList.add("casilla");
    div.id = "casilla-" + i;
    div.textContent = i;
    camino.appendChild(div);
}

actualizarTablero();

// --- FUNCIONES ---

function tirarDado() {
    const dado = Math.floor(Math.random() * 6) + 1;
    document.getElementById("resultado").textContent = "Resultado: " + dado;

    posiciones[turno] += dado;
    if (posiciones[turno] > totalCasillas) posiciones[turno] = totalCasillas;

    actualizarTablero();

    if (posiciones[turno] === totalCasillas) {
        alert("¡Jugador " + (turno + 1) + " ha ganado!");
        return;
    }

    turno = (turno + 1) % 2;
    document.getElementById("turno").textContent = "Turno: Jugador " + (turno + 1);
}

function actualizarTablero() {
    // limpiar marcas
    for (let i = 1; i <= totalCasillas; i++) {
        const cas = document.getElementById("casilla-" + i);
        cas.className = "casilla";
    }

    // jugador 1
    document.getElementById("casilla-" + posiciones[0]).classList.add("jugador1");

    // jugador 2
    document.getElementById("casilla-" + posiciones[1]).classList.add("jugador2");
}
