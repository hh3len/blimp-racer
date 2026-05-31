import {P} from './physics.js';
import * as U from './utils.js';

export function updateSB(game, state, target, input) {
    // VEHICLE
    document.getElementById('x').textContent = U.format(state.x);
    document.getElementById('y').textContent = U.format(state.y);
    document.getElementById('z').textContent = U.format(state.z);
    document.getElementById('psi').textContent = U.format(U.radToDeg(state.psi)) + '°';
    document.getElementById('u').textContent = U.format(state.u);
    document.getElementById('w').textContent = U.format(state.w);
    document.getElementById('r').textContent = U.format(state.r);

    // MOTORS
    document.getElementById('m1').style.width = Math.min(input.F1 / P.F_max, 1) * 100 + '%';
    document.getElementById('m2').style.width = Math.min(input.F2 / P.F_max, 1) * 100 + '%';
    document.getElementById('m3').style.width = Math.min(Math.abs(input.Fz) / P.F_max, 1) * 100 + '%';

    // TARGET
    document.getElementById('dist').textContent = U.format(U.dist(state, target).dist2D);
    document.getElementById('dz').textContent = U.format(U.dist(state, target).dz);
    document.getElementById('brg').textContent = U.format(U.dist(state, target).brg) + '°';

    // SCORE
    document.getElementById('score').textContent = game.score;
    
    // SYSTEM
    if (game.timerStarted) {
        // Calculate current time
        const elapsed = (performance.now() - game.startTime) / 1000;
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        document.getElementById('time-elapsed').textContent = 'T+' + mm + ':' + ss;
    }
}