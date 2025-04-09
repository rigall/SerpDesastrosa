// Constants del joc
const PUNT_MIDA = 10; // Mida d’un segment de la serp (i de la poma)
const MAX_RAND = 29; // Nombre màxim aleatori per col·locar la poma dins del canvas
const TOTS_PPUNTS = 900; // Nombre total de punts possibles (no s'utilitza en aquest codi)
const C_AMPLE = 300; // Amplada del canvas
const C_ALTURA = 300; // Alçada del canvas
const RETARD = 140; // Temps en mil·lisegons entre cada moviment de la serp
const DIRECCIONS = {
  ESQUERRE: 'ESQUERRE',
  DRETA: 'DRETA',
  AMUNT: 'AMUNT',
  AVALL: 'AVALL'
};

// Variables del joc
let canvas, ctx; // Referències al canvas i el context gràfic
let imatges = {}; // Objecte per guardar les imatges (cap, cos, poma)
let serp = { x: [], y: [], longitud: 3, direccio: DIRECCIONS.DRETA }; // Posicions i estat de la serp
let poma = { x: 0, y: 0 }; // Posició de la poma
let inGame = true; // Indica si el joc està actiu o ha acabat

// Quan la pàgina es carrega, s'inicialitza el joc
window.onload = iniciarJoc;

function iniciarJoc() {
  // Inicialitzem el canvas i el context
  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');

  // Carreguem les imatges i inicialitzem les posicions
  carregarImatges();
  inicialitzarSerp();
  generarPoma();

  // Assignem la funció per gestionar les tecles
  document.onkeydown = gestionarTecles;

  // Comencem el bucle principal del joc
  gameCycle();
}

function carregarImatges() {
  // Assignem les imatges al cap, cos i poma
  imatges.cap = carregarImatge('head.png');
  imatges.cos = carregarImatge('dot.png');
  imatges.poma = carregarImatge('apple.png');
}

function carregarImatge(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function inicialitzarSerp() {
  // Creem la serp amb la seva longitud inicial
  for (let i = 0; i < serp.longitud; i++) {
    serp.x[i] = 50 - i * PUNT_MIDA; // Segments consecutius cap a l'esquerra
    serp.y[i] = 50; // Tots a la mateixa altura
  }
}

function generarPoma() {
  // Col·loquem la poma en una posició aleatòria dins el canvas
  poma.x = Math.floor(Math.random() * MAX_RAND) * PUNT_MIDA;
  poma.y = Math.floor(Math.random() * MAX_RAND) * PUNT_MIDA;
}

function gestionarTecles(e) {
  // Canviem la direcció de la serp segons la tecla premuda
  const dir = serp.direccio;
  switch (e.keyCode) {
    case 37: if (dir !== DIRECCIONS.DRETA) serp.direccio = DIRECCIONS.ESQUERRE; break; // Fletxa esquerra
    case 39: if (dir !== DIRECCIONS.ESQUERRE) serp.direccio = DIRECCIONS.DRETA; break; // Fletxa dreta
    case 38: if (dir !== DIRECCIONS.AVALL) serp.direccio = DIRECCIONS.AMUNT; break; // Fletxa amunt
    case 40: if (dir !== DIRECCIONS.AMUNT) serp.direccio = DIRECCIONS.AVALL; break; // Fletxa avall
  }
}

function gameCycle() {
  // Bucle principal del joc
  if (!inGame) return mostrarGameOver(); // Si el joc ha acabat, mostrem el missatge

  moureSerp();         // Actualitzem la posició de la serp
  comprovarColisions(); // Mirem si hi ha col·lisions
  comprovarPoma();     // Mirem si la serp ha menjat la poma
  dibuixar();          // Dibuixem el joc

  // Esperem uns mil·lisegons i tornem a cridar gameCycle
  setTimeout(gameCycle, RETARD);
}

function moureSerp() {
  // Fem que cada segment segueixi el segment anterior
  for (let i = serp.longitud; i > 0; i--) {
    serp.x[i] = serp.x[i - 1];
    serp.y[i] = serp.y[i - 1];
  }

  // Actualitzem la posició del cap segons la direcció
  switch (serp.direccio) {
    case DIRECCIONS.ESQUERRE: serp.x[0] -= PUNT_MIDA; break;
    case DIRECCIONS.DRETA:    serp.x[0] += PUNT_MIDA; break;
    case DIRECCIONS.AMUNT:    serp.y[0] -= PUNT_MIDA; break;
    case DIRECCIONS.AVALL:    serp.y[0] += PUNT_MIDA; break;
  }
}

function comprovarColisions() {
  const [capX, capY] = [serp.x[0], serp.y[0]];

  // Si la serp toca una paret, perdem
  if (capX < 0 || capX >= C_AMPLE || capY < 0 || capY >= C_ALTURA) inGame = false;

  // Si la serp toca el seu propi cos, perdem
  for (let i = 4; i < serp.longitud; i++) {
    if (capX === serp.x[i] && capY === serp.y[i]) {
      inGame = false;
      break;
    }
  }
}

function comprovarPoma() {
  // Si el cap de la serp toca la poma...
  if (serp.x[0] === poma.x && serp.y[0] === poma.y) {
    serp.longitud++; // Allarguem la serp
    generarPoma();   // Generem una nova poma
  }
}

function dibuixar() {
  // Esborrem tot el canvas
  ctx.clearRect(0, 0, C_AMPLE, C_ALTURA);

  // Dibuixem la poma
  ctx.drawImage(imatges.poma, poma.x, poma.y);

  // Dibuixem cada segment de la serp
  for (let i = 0; i < serp.longitud; i++) {
    const img = i === 0 ? imatges.cap : imatges.cos;
    ctx.drawImage(img, serp.x[i], serp.y[i]);
  }
}

function mostrarGameOver() {
  // Mostrem el text de "Game Over" i els punts aconseguits
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px serif';
  const punts = serp.longitud - 3; // Puntuen només les pomes menjades
  ctx.fillText(`${punts} ${punts === 1 ? 'punt' : 'punts'} - Game over`, C_AMPLE / 2, C_ALTURA / 2);
}
