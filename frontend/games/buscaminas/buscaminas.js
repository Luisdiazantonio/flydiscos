const NIVELES = {
    facil: { rows: 8, cols: 8, minas: 10, nombre: "Fácil", tiempo: 60 },
    intermedio: { rows: 16, cols: 16, minas: 40, nombre: "Media", tiempo: 150 },
    experto: { rows: 16, cols: 30, minas: 99, nombre: "Difícil", tiempo: 180 }
};

let NIVEL_ACTUAL = 'facil';
let currentRows, currentCols, currentMinas, tiempoLimite;
let tablero = document.getElementById('tablero');
let mensaje = document.getElementById('mensaje');
let minasRestantesDisplay = document.getElementById('minas-restantes');
let tiempoDisplay = document.getElementById('tiempo');
let emojiCara = document.getElementById('emoji-cara');
let dificultadDisplay = document.getElementById('dificultad-display');

let casillas = [];
let minasMarcadas = 0;
let casillasReveladas = 0;
let juegoTerminado = false;
let tiempoInicio = null;
let tiempoRestante = null;
let temporizador = null;

// Configurar botones de nivel
document.querySelectorAll('.nivel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelector('.nivel-btn.activo').classList.remove('activo');
        this.classList.add('activo');
        NIVEL_ACTUAL = this.dataset.nivel;
        reiniciarJuego();
    });
});

function iniciarJuego() {
    juegoTerminado = false;
    casillasReveladas = 0;
    minasMarcadas = 0;
    mensaje.textContent = '';
    emojiCara.textContent = '🙂';
    clearInterval(temporizador);
    tiempoInicio = null;

    const config = NIVELES[NIVEL_ACTUAL];
    dificultadDisplay.textContent = `Dificultad: ${config.nombre}`;
    currentRows = config.rows;
    currentCols = config.cols;
    currentMinas = config.minas;
    tiempoLimite = config.tiempo;
    tiempoRestante = tiempoLimite;
    tiempoDisplay.textContent = tiempoRestante;
    minasRestantesDisplay.textContent = currentMinas;

    const maxDim = Math.max(currentRows, currentCols);
    const cellSize = Math.max(28, Math.min(50, Math.floor((window.innerWidth - 100) / maxDim)));
    tablero.style.setProperty('--cell-size', `${cellSize}px`);
    tablero.style.setProperty('--cols', currentCols);
    tablero.style.setProperty('--rows', currentRows);

    inicializaTablero();
}

function inicializaTablero() {
    tablero.innerHTML = '';
    casillas = [];
    for (let i = 0; i < currentRows; i++) {
        casillas[i] = [];
        for (let j = 0; j < currentCols; j++) {
            let casilla = document.createElement('div');
            casilla.classList.add('casilla');
            casilla.dataset.row = i;
            casilla.dataset.col = j;
            casilla.dataset.state = 'hidden';
            casilla.addEventListener('click', manejarClickIzquierdo);
            casilla.addEventListener('contextmenu', manejarClickDerecho);
            tablero.appendChild(casilla);
            casillas[i][j] = casilla;
        }
    }
}

function colocarMinasExcluyendo(excludeRow, excludeCol) {
    let colocadas = 0;
    while (colocadas < currentMinas) {
        let row = Math.floor(Math.random() * currentRows);
        let col = Math.floor(Math.random() * currentCols);
        if ((row !== excludeRow || col !== excludeCol) && casillas[row][col].dataset.mine !== 'true') {
            casillas[row][col].dataset.mine = 'true';
            colocadas++;
        }
    }
}

function iniciarTemporizador() {
    temporizador = setInterval(() => {
        tiempoRestante--;
        tiempoDisplay.textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            revelarTodasMinas();
            mostrarMensaje('¡Tiempo agotado! ⏰ Has perdido', true);
            emojiCara.textContent = '😵';
            juegoTerminado = true;
        }
    }, 1000);
}

function manejarClickIzquierdo(e) {
    e.preventDefault();
    if (juegoTerminado) return;

    let casilla = e.target;
    let row = parseInt(casilla.dataset.row);
    let col = parseInt(casilla.dataset.col);
    if (casilla.dataset.state !== 'hidden') return;

    if (!tiempoInicio) {
        tiempoInicio = Date.now();
        colocarMinasExcluyendo(row, col);
        iniciarTemporizador();
    }

    if (casilla.dataset.mine === 'true') {
        revelarTodasMinas();
        casilla.classList.add('mina-explotada');
        mostrarMensaje('¡Boom! Has perdido 💥', true);
        emojiCara.textContent = '💀';
        juegoTerminado = true;
        clearInterval(temporizador);
    } else {
        revelarCasilla(row, col);
        if (casillasReveladas === currentRows * currentCols - currentMinas) {
            revelarTodasMinas();
            mostrarMensaje('¡Ganaste! 🎉', false);
            emojiCara.textContent = '😎';
            juegoTerminado = true;
            clearInterval(temporizador);
        }
    }
}

function manejarClickDerecho(e) {
    e.preventDefault();
    if (juegoTerminado) return;

    let casilla = e.target;
    if (casilla.dataset.state === 'revealed') return;

    if (casilla.dataset.state === 'hidden') {
        casilla.textContent = '🚩';
        casilla.dataset.state = 'flag';
        minasMarcadas++;
    } else if (casilla.dataset.state === 'flag') {
        casilla.textContent = '';
        casilla.dataset.state = 'hidden';
        minasMarcadas--;
    }
    minasRestantesDisplay.textContent = currentMinas - minasMarcadas;
}

function revelarCasilla(row, col) {
    let casilla = casillas[row][col];
    if (casilla.dataset.state !== 'hidden') return;

    let count = contarMinasCercanas(row, col);
    casilla.textContent = count || '';
    if (count > 0) casilla.classList.add('num-' + count);
    casilla.dataset.state = 'revealed';
    casilla.classList.add('revealed');
    casillasReveladas++;

    if (count === 0) {
        for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, currentRows - 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, currentCols - 1); j++) {
                if (i !== row || j !== col) {
                    revelarCasilla(i, j);
                }
            }
        }
    }
}

function contarMinasCercanas(row, col) {
    let count = 0;
    for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, currentRows - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, currentCols - 1); j++) {
            if (casillas[i][j].dataset.mine === 'true') count++;
        }
    }
    return count;
}

function revelarTodasMinas() {
    for (let i = 0; i < currentRows; i++) {
        for (let j = 0; j < currentCols; j++) {
            let casilla = casillas[i][j];
            if (casilla.dataset.mine === 'true') {
                if (casilla.dataset.state === 'flag') continue;
                casilla.textContent = '💣';
                casilla.classList.add('revealed', 'mine');
            }
        }
    }
}

function mostrarMensaje(texto, esPerdido) {
    mensaje.textContent = texto + ' (Clic en título o nivel para reiniciar)';
    mensaje.style.color = esPerdido ? '#ff4444' : '#44ff44';
}

function reiniciarJuego() {
    iniciarJuego();
}

// Iniciar el juego al cargar
iniciarJuego();