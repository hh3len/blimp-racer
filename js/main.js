import {P, derivatives, rk4} from './physics.js';
import * as U from './utils.js';
import * as CV from './canvas.js';
import * as SB from '../sidebar.js';

// Initialize scoreboard, state, and target
let timerStarted = false;
let startTime = null;
let score = 0;

let S = {
    x: 0.0, // global x position [m]
    y: 0.0, // global y position [m]
    z: 1.0, // global z posiion [m]
    psi: 0.0, // heading [rad]
    u: 0.0, // surge velocity [m/s]
    w: 0.0, // heave velocity [m/s]
    r: 0.0, // yaw velocity [rad/s]
};

// Generate & define random target
function newTarget() {
    return {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6,
        z: Math.random() * 3 + 0.5 // Minimum z height
    };
}
let T = newTarget();

// Game states
const LEVEL = {
    TUTORIAL: 'tutorial',
    EASY: 'easy',
    HARD: 'hard',
    CHALLENGE: 'challenge',
    RESULTS: 'results',
};

let gameLevel = LEVEL.TUTORIAL;
let tutorialStep = 0;


// Tutorial script
const TUTORIAL_STEPS = [
    {
        text: ['WELCOME TO THE AMASS AIRSHIP SIMULATOR',
               'Think you have what it takes to be a pilot?',
               '',
               'Press SPACE to continue'],
        action: 'space', // Advance
        lock: true, // Pause controls
    },
    {
        text: ['YAW + SURGE',
               'Press LEFT / RIGHT to rotate',
               'and thrust forward.',
               '',
               'Hit the target to continue'],
        action: 'capture', // Advance
        lock: false,
        targetPos: { x: 2, y: 0, z: 1.0 },  // fixed position in metres
    },
    {
        text: ['ALTITUDE',
               'Press UP to rise, DOWN to sink.',
               '',
               'Hit the target to continue'],
        action: 'capture',
        lock: false,
        targetPos: { x: 0, y: 0, z: 2.5 },  // high target forces altitude change
    },
    {
        text: ['COMBINED CONTROLS',
               'Use all controls together.',
               'Hit the target to continue'],
        action: 'capture',
        lock: false,
        targetPos: null,       // random
    },
    {
        text: ['YOU\'RE READY TO FLY',
               'Complete each level as fast as possible.',
               'Stay close to the path for a score multiplier.',
               '',
               'Press SPACE to begin'],
        action: 'space',
        lock: true,
    },
];

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
    if (S.z < P.b) {
        S.z = P.b;
        S.w = Math.max(0.2, S.w); // Possibly implement CBF here
    }

    // Check if ship is within capture radius
    if (U.dist(S, T).dist < P.CAPTURE_RAD) {
        score++;
        T = newTarget();
    }

    CV.draw(S, T);
    SB.updateSB(S, T, I, score, timerStarted, startTime);
    requestAnimationFrame(mainLoop);
}

// Game loop
requestAnimationFrame(mainLoop);