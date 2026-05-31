import {P} from './physics.js';
import * as U from './utils.js';

// Cache DOM references
const E = {
    x: document.getElementById('x'),
    y: document.getElementById('y'),
    z: document.getElementById('z'),
    psi: document.getElementById('psi'),
    u: document.getElementById('u'),
    w: document.getElementById('w'),
    r: document.getElementById('r'),

    m1: document.getElementById('m1'),
    m2: document.getElementById('m2'),
    m3: document.getElementById('m3'),

    dist: document.getElementById('dist'),
    dz: document.getElementById('dz'),
    brg: document.getElementById('brg'),

    score: document.getElementById('score'),
    timer: document.getElementById('time-elapsed'),
};

export function updateSB(game, state, target, input) {
    // VEHICLE
    E.x.textContent = U.format(state.x);
    E.y.textContent = U.format(state.y);
    E.z.textContent = U.format(state.z);
    E.psi.textContent = U.format(U.radToDeg(state.psi)) + '°';
    E.u.textContent = U.format(state.u);
    E.w.textContent = U.format(state.w);
    E.r.textContent = U.format(state.r);

    // MOTORS
    E.m1.style.width = Math.min(input.F1 / P.F_max, 1) * 100 + '%';
    E.m2.style.width = Math.min(input.F2 / P.F_max, 1) * 100 + '%';
    E.m3.style.width = Math.min(Math.abs(input.Fz) / P.F_max, 1) * 100 + '%';

    // TARGET
    const delta = U.dist(state, target);

    E.dist.textContent = U.format(delta.dist2D);
    E.dz.textContent = U.format(delta.dz);
    E.brg.textContent = U.format(delta.brg) + '°';

    // SCORE
    E.score.textContent = game.sc;
    
    // SYSTEM
    if (game.timerStarted) {
        // Calculate current time
        const elapsed = (performance.now() - game.t) / 1000;
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        E.timer.textContent = 'T+' + mm + ':' + ss;
    }
}