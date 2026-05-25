import {P, derivatives, rk4} from './physics.js';
import * as D from './draw.js';

// Initialize scoreboard, state, and target
let timerStarted = false;
let startTime = null;
let score = 0;

let state = {
    x: 0, // global x position [px]
    y: 0, // global y position [px]
    z: 150, // global z posiion [px]
    psi: 0, // heading [rad]
    u: 0, // surge velocity [m/s]
    w: 0, // heave velocity [m/s]
    r: 0, // yaw velocity [rad/s]
};

// Generate & define random target
function newTarget() {
    return {
        x: Math.random() * (D.canvasTop.width),
        y: Math.random() * (D.canvasTop.height),
        z: Math.random() * (D.canvasSide.height) + 36 // Minimum z height
    };
}

let target = newTarget();

// User-controlled inputs
const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
};

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    e.preventDefault();

    if (!timerStarted) {
        timerStarted = true;
        startTime = performance.now();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
    if (e.key === 'ArrowLeft') keys.left = false;
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
    state = rk4(state, inp);

    // Wrap heading to [-pi, pi]
    state.psi = ((state.psi + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Clamp z to be above ground
    if (state.z < 22) {
        state.z = 22;
        state.w = Math.max(0.5, state.w); // Possibly implement CBF here
    }

    // Check if ship is within capture radius
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const dz = target.z - state.z;
    const captured = 30;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < captured) {
        score++;
        target = newTarget();
    }      

    D.draw(state, target, score, timerStarted, startTime);
    requestAnimationFrame(gameLoop);
}

// Game loop
requestAnimationFrame(gameLoop);