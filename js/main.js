import {P, derivatives, rk4} from './physics.js';
import * as U from './utils.js';
import * as CV from './canvas.js';
import * as SB from './sidebar.js';

// Initialize scoreboard, state, and target
let timerStarted = false;
let startTime = null;
let score = 0;

// State store global x/y/z position [m], heading [rad], surge/heave/yaw velocity [m/s]
let S = { x: 0.0, y: 0.0, z: 1.0, psi: 0.0, u: 0.0, w: 0.0, r: 0.0};

// Generate & define random target
let newTarget = () => ({
    x: (Math.random() - 0.5) * 6,
    y: (Math.random() - 0.5) * 6,
    z: Math.random() * 3 + 0.5 // Minimum z height
});
let T = newTarget();

// User controls
const keys = { up: false, down: false, left: false, right: false };

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

window.addEventListener('blur', () => {
    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
});

function mainLoop(timestamp) {
    /** Calculate motor thrust force from keyboard inputs
     * M1 = left, M2 = right, M3 = up/down
     */
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
    if (S.z < P.b) {
        S.z = P.b;
        S.w = Math.max(0.2, S.w); // Possibly implement CBF here
    }

    // Capture check
    if (U.dist(S, T).dist3D < P.CAPTURE_RAD) {
        score++;
        T = newTarget();
    }

    // Draw canvas & sidebar
    CV.draw(S, T);
    SB.updateSB(S, T, thrust, score, timerStarted, startTime);

    requestAnimationFrame(mainLoop);
}

// Game loop
requestAnimationFrame(mainLoop);