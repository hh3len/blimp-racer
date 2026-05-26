import {P, derivatives, rk4} from './physics.js';
import * as CV from './canvas.js';
import * as SB from './sidebar.js';

// Initialize scoreboard, state, and target
let timerStarted = false;
let startTime = null;
let score = 0;

let S = {
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
        x: Math.random() * (CV.canvasTop.width),
        y: Math.random() * (CV.canvasTop.height),
        z: Math.random() * (CV.canvasSide.height) + 36 // Minimum z height
    };
}
let T = newTarget();

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

function mainLoop(timestamp) {
    const F1 = keys.right ? P.F_lat : 0; // Right motor thrust
    const F2 = keys.left ? P.F_lat : 0; // Left motor thrust
    // Up key → positive Fz → positive dw → w increases → z increases → blimp rises & vice versa for down
    const Fz = (keys.up ? P.F_vert : 0) - (keys.down ? P.F_vert : 0);

    /* Fx (surge thrust)
     * Mz (differential torque)
     * Fz (heave thrust) */
    const I = {
        Fx: F1 + F2,
        Mz: (F1 - F2) * P.ly,
        Fz: Fz,
    };

    // Compute & update state
    S = rk4(S, I);

    // Wrap heading to [-pi, pi]
    S.psi = ((S.psi + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

    // Clamp z to be above ground
    if (S.z < 22) {
        S.z = 22;
        S.w = Math.max(0.5, S.w); // Possibly implement CBF here
    }

    // Check if ship is within capture radius
    const dx = T.x - S.x;
    const dy = T.y - S.y;
    const dz = T.z - S.z;
    const captured = 30;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < captured) {
        score++;
        T = newTarget();
    }      

    CV.draw(S, T);
    SB.updateSB(S, T, I, score, timerStarted, startTime);
    requestAnimationFrame(mainLoop);
}

// Game loop
requestAnimationFrame(mainLoop);