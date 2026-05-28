import {P, derivatives, rk4} from './physics.js';
import * as U from './utils.js';
import * as CV from './canvas.js';
import * as SB from './sidebar.js';

// Stores global x/y/z position [m], heading [rad], surge/heave/yaw velocity [m/s]
const newState = ()=> ({ x: 0.0, y: 0.0, z: 1.0, psi: 0.0, u: 0.0, w: 0.0, r: 0.0 });
const newGame = ()=> ({ timerStarted: false, startTime: null, score: 0, trailX: [], trailY: [], trailZ: [], frame: 0 }); // Timer, score, and display variables
const newTarget = ()=> ({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6, z: Math.random() * 3 + 0.5 }); // Target position

// Initialize variables
let S = newState();
let G = newGame();
let T = newTarget();

const reset = ()=> { S = newState(); G = newGame(); T = newTarget(); }; // Resets board

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

    if (!G.timerStarted) {
        G.timerStarted = true;
        G.startTime = performance.now();
    }
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
    
    // Up = positive Fz = positive dw = w increases = z increases = blimp rises & vice versa for down
    const Fz = (keys.up ? P.F_step_v : 0) - (keys.down ? P.F_step_v : 0);

    /* Fx (surge thrust)
     * Mz (differential torque)
     * Fz (heave thrust) */
    const I = {
        F1, F2, Fx: F1 + F2,
        Mz: (F1 - F2) * P.ly,
        Fz
    };

    // Compute & update state
    S = rk4(S, I);

    // Wrap heading to [-pi, pi]
    S.psi = ((S.psi + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Clamp z to be entirely above ground
    if (S.z < P.b) { S.z = P.b; S.w = Math.max(0.2, S.w); }

    // Trail
    if (G.frame % 3 === 0) {
        G.trailX.push(S.x); G.trailY.push(S.y); G.trailZ.push(S.z);
        if (G.trailX.length > 300) {
            G.trailX.shift(); G.trailY.shift(); G.trailZ.shift();
        }
    }

    // Check if ship is within capture radius
    if (U.dist(S, T).dist < P.CAPTURE_RAD) {
        G.score++;
        T = newTarget();
    }

    // Update frame count
    G.frame++;

    CV.draw(S, T, G);
    SB.updateSB(S, T, I, G);
    requestAnimationFrame(mainLoop);
}

// Game loop
requestAnimationFrame(mainLoop);