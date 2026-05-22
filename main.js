// Initialize scoreboard, state, and target
let score = 0;
let timerStarted = false;
let startTime = null;

let state = {
    x: 250,     // global x position [pixels]
    y: 150,     // global y position [pixels]
    z: 120,     // global z posiion [pixels]
    u: 0,       // surge velocity [m/s]
    w: 0,       // heave velocity [m/s]
    r: 0,       // yaw velocity [rad/s]
    psi: 0,     // heading [rad]
};

let target = newTarget();

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

// Game loop
requestAnimationFrame(draw);