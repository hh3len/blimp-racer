import {P, newTarget, derivatives, rk4} from './physics.js';
import * as D from './draw.js';

// Initialize scoreboard, state, and target
let timerStarted = false;
let startTime = null;
let score = 0;
let target = newTarget();

let state = {
    x: 250, // global x position [pixels]
    y: 150, // global y position [pixels]
    z: 120, // global z posiion [pixels]
    psi: 0, // heading [rad]
    u: 0, // surge velocity [m/s]
    w: 0, // heave velocity [m/s]
    r: 0, // yaw velocity [rad/s]
};

// User-controlled inputs
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
};

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp')    keys.up    = true;
    if (e.key === 'ArrowDown')  keys.down  = true;
    if (e.key === 'ArrowLeft')  keys.left  = true;
    if (e.key === 'ArrowRight') keys.right = true;
    e.preventDefault();

    if (!timerStarted) {
        timerStarted = true;
        startTime = performance.now();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowUp')    keys.up    = false;
    if (e.key === 'ArrowDown')  keys.down  = false;
    if (e.key === 'ArrowLeft')  keys.left  = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

function gameLoop() {
    const F1 = keys.right ? P.F_lat : 0; // Right motor thrust
    const F2 = keys.left ? P.F_lat : 0; // Left motor thrust

    // Up key → positive Fz → positive dw → w increases → z increases → blimp rises & vice versa for down
    const Fz = (keys.up ? P.F_vert : 0) - (keys.down ? P.F_vert : 0);

    /** Calculate & save inputs:
     * Fx (surge thrust)
     * Mz (differential torque)
     * Fz (heave thrust)
    */
    const inp = {
        Fx: F1 + F2,
        Mz: (F1 - F2) * P.ly,
        Fz: Fz,
    };

    // Compute & update state
    state = rk4(state, inp, 0.025);

    // Wrap heading to [-π, π]
    state.psi = ((state.psi + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    
    // Clamp to canvas bounds
    state.x = Math.max(55, Math.min(D.canvasTop.width  - 55, state.x));
    state.y = Math.max(22, Math.min(D.canvasTop.height - 22, state.y));

    if (state.z < 0) {
        state.z = 0;
        state.w = Math.max(0, state.w);
    }

    // Check if captured
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const dz = target.z - state.z;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < 30) {
        score++;
        target = newTarget();
    }      

    D.draw(state, target, score, timerStarted, startTime);
    requestAnimationFrame(gameLoop);
}

// Game loop
requestAnimationFrame(gameLoop);