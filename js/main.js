import { P, derivatives, rk4 } from './physics.js';
import { LEVELS } from './levels.js';
import * as U from './utils.js';
import * as CV from './canvas.js';
import * as SB from './sidebar.js';

// Resolves from /play/01 -> "01", etc.
// Falls back to "01" if run from game.html directly (local dev)
const segments = window.location.pathname.split('/').filter(Boolean);
const levelId = segments[1] ?? '01';
const LEVEL = LEVELS[levelId] ?? LEVELS['01'];

const levelConfig = LEVELS[levelId];
if (!levelConfig) {
  console.error(`Unknown level: ${levelId}`);
  window.location.href = '/levels.html';
}

// Stores global x/y/z position [m], heading [rad], surge/heave/yaw velocity [m/s]
const newState = () => ({ x: 0.0, y: 0.0, z: 1.0, psi: 0.0, u: 0.0, w: 0.0, r: 0.0 });
const newGame = () => ({ timerStarted: false, startTime: null, score: 0, trailX: [], trailY: [], trailZ: [], frame: 0 }); // Timer, score, and display variables
const newTarget = () => ({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6, z: Math.random() * 3 + 0.5 }); // Target position

// Initialize variables
let S = newState();
let G = newGame();
let T = newTarget();

function reset() { S = newState(); G = newGame(); T = newTarget(); }; // Resets board
function triggerFlash() {
 const el = document.getElementById('flash'); 
 el.style.opacity = '0.25'; setTimeout(() => { el.style.opacity = '0'; }, 100);
}

function onLevelComplete() {
  triggerFlash();
  setTimeout(() => {
    window.location.href = LEVEL.onComplete;
  }, 1500);
}

// User-controlled inputs
const keys = { up: false, down: false, left: false, right: false };

document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp': keys.up = true; e.preventDefault(); break;
        case 'ArrowDown': keys.down = true; e.preventDefault(); break;
        case 'ArrowLeft': keys.left = true; e.preventDefault(); break;
        case 'ArrowRight': keys.right = true; e.preventDefault(); break;

        case 'r': case 'R': reset(); break;
        case 'n': case 'N': T = newTarget(); break;
    }

    // Start timer on keypress
    if (!G.timerStarted) { G.timerStarted = true; G.startTime = performance.now(); }
});

document.addEventListener('keyup', e => {
    switch(e.key) {
        case 'ArrowUp': keys.up = false; break;
        case 'ArrowDown': keys.down = false; break;
        case 'ArrowLeft': keys.left = false; break;
        case 'ArrowRight': keys.right = false; break;
    }
});

function mainLoop(timestamp) {
    const F1 = keys.left ? P.F_step : 0;
    const F2 = keys.right ? P.F_step : 0;
    const Fz = (keys.up ? P.F_step_v : 0) - (keys.down ? P.F_step_v : 0); 

    // Motor thrust values (only used for visual display)
    const thrust = { F1, F2, Fz };

    /** Inputs used to compute derived state:
     * Fx (surge thrust)
     * Mz (differential torque)
     * Fz (heave thrust) */
    const I = { Fx: F1 + F2, Mz: (F1 - F2) * P.ly, Fz };

    // Compute & update state
    S = rk4(S, I);

    // Wrap heading to [-pi, pi]
    S.psi = ((S.psi + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Clamp z to be entirely above ground
    if (S.z < P.b) { S.z = P.b; S.w = Math.max(0.2, S.w); }

    // Trail
    if (G.frame % 3 === 0) {
        G.trailX.push(S.x); G.trailY.push(S.y); G.trailZ.push(S.z);
        if (G.trailX.length > 100) {
            G.trailX.shift(); G.trailY.shift(); G.trailZ.shift();
        }
        G.frame = 0;
    }
    G.frame++; // Update loop counter

    // Capture & win check
    if (U.dist(S, T).dist3D < P.CAPTURE_RAD) {
        G.score++; triggerFlash();
        if (G.score >= LEVEL.scoreToWin) { onLevelComplete(); return; }
        T = newTarget(); 
    }

    CV.draw(G, S, T);
    SB.updateSB(G, S, T, thrust);
    requestAnimationFrame(mainLoop);
}

let lastTime = 0, fpsAccum = 0, fpsCount = 0, fpsDisplay = 0;

function timerLoop(timestamp) {
 const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
 const E = document.getElementById('fps');
 lastTime = timestamp; fpsAccum += dt; fpsCount++;

 if (fpsAccum >= 0.5) { fpsDisplay = fpsCount / fpsAccum; fpsAccum = 0; fpsCount = 0; }

 const fps = fpsCount % 100 === 0 ? '0' : fpsDisplay.toFixed(0); 
 E.textContent = fps + ' FPS';

 requestAnimationFrame(timerLoop);
}

requestAnimationFrame(mainLoop);
requestAnimationFrame(timerLoop);