import { P, derivatives, rk4 } from './physics.js';
import { LEVELS } from './levels.js';
import { leaderControl, newWaypoint } from './controller.js';
import * as U from './utils.js';
import * as CV from './canvas.js';
import * as SB from './sidebar.js';

// Function to get the level setting
function getLevelSettings() {
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level') ?? '01'; // Default to level 01
    // Return the settings for the current level, or a default
    return LEVELS[levelId];
}

const LEVEL = getLevelSettings();
const FOLLOW_MODE = LEVEL.mode === 'follow';

// Stores global x/y/z position [m], heading [rad], surge/heave/yaw velocity [m/s]
const newState = () => ({ x: 0.0, y: 0.0, z: 1.0, psi: 0.0, u: 0.0, v: 0.0, w: 0.0, r: 0.0 });

// Timer, score, and display variables
const newGame = () => ({ 
    scoreToWin: LEVEL.scoreToWin ?? null, 
    timerStarted: false, startTime: null, 
    thrust: { F1: 0, F2: 0, Fz: 0 },
    score: 0, trailX: [], trailY: [], trailZ: [], frame: 0,
    mode: LEVEL.mode ?? 'capture', 
    followTime: LEVEL.followTime ?? null,
    followSince: null, followElapsed: 0, completed: false,
    leaderTrailX: [], leaderTrailY: [], leaderTrailZ: [],
});

const newTarget = () => ({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6, z: Math.random() * 3 + 0.5 }); // Target position
const newLeader = () => ({ x: 2.0, y: 1.5, z: 1.5, psi: Math.PI * 0.75, u: 0.0, v: 0.0, w: 0.0, r: 0.0 });

// Initialize variables
let S = newState();
let G = newGame();
let T = newTarget();
let L = FOLLOW_MODE ? newLeader() : null;
let W = FOLLOW_MODE ? newWaypoint() : null;

// Resets sim
function reset() { S = newState(); G = newGame(); T = newTarget(); 
    if (FOLLOW_MODE) { L = newLeaderState(); W = newWaypoint(); }
};

function triggerFlash() {
 const el = document.getElementById('flash'); 
 el.style.opacity = '0.25'; setTimeout(() => { el.style.opacity = '0'; }, 100);
}

function onLevelComplete() {
  triggerFlash();
  setTimeout(() => {
    window.location.href = "/levels.html";
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
    G.thrust = { F1, F2, Fz };

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
    }

    // Capture/win check 
    if (!FOLLOW_MODE && U.dist(S, T).dist3D < P.CAPTURE_RAD) {
        G.score++; triggerFlash(); 
        setTimeout(() => { if (G.score >= G.scoreToWin) { onLevelComplete(); return; }}, 1);
        T = newTarget(); 
    }

    // LEADER BLIMP (level 2 / follow mode): runs through the same rk4 physics,
    // driven by a proportional autopilot instead of keyboard input.
    if (FOLLOW_MODE) {
        const ctrl = leaderControl(L, W);
        L = rk4(L, { Fx: ctrl.Fx, Mz: ctrl.Mz, Fz: ctrl.Fz });
        L.psi = U.wrapAngle(L.psi);
        if (L.z < P.b) { L.z = P.b; L.w = Math.max(0.2, L.w); }
        if (ctrl.reached) { W = newWaypoint(); }

        // Trail (leader)
        if (G.frame % 3 === 0) {
            G.leaderTrailX.push(L.x); G.leaderTrailY.push(L.y); G.leaderTrailZ.push(L.z);
            if (G.leaderTrailX.length > 100) {
                G.leaderTrailX.shift(); G.leaderTrailY.shift(); G.leaderTrailZ.shift();
            }
        }

        // Win check: stay within followRadius of the leader continuously for followTime seconds
        const followDist = U.dist(S, L).dist3D;
        if (followDist < LEVEL.followRadius) {
            if (G.followSince === null) G.followSince = timestamp;
            G.followElapsed = (timestamp - G.followSince) / 1000;
            if (!G.completed && G.followElapsed >= LEVEL.followTime) {
                G.completed = true;
                onLevelComplete();
            }
        } else {
            G.followSince = null;
            G.followElapsed = 0;
        }
    }

    if (G.frame % 3 === 0) { G.frame = 0; }
    G.frame++; // Update loop counter

    CV.draw(G, S, T, FOLLOW_MODE ? L : null);
    SB.updateSB(G, S, T, L);
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