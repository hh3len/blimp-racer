import {P} from './physics.js';
import * as U from './utils.js';

export function updateHUD(state, target, input, score, timerStarted, t) {
    // VEHICLE
    document.getElementById('x').textContent = U.format(state.x / P.SCALE);
    document.getElementById('y').textContent = U.format(state.y / P.SCALE);
    document.getElementById('z').textContent = U.format(state.z / P.SCALE);
    document.getElementById('psi').textContent = U.format(U.radToDeg(state.psi)) + '°';
    document.getElementById('u').textContent = U.format(state.u);
    document.getElementById('w').textContent = U.format(state.w);
    document.getElementById('r').textContent = U.format(state.r);

    // MOTORS
    document.getElementById('mb1').style.width = Math.min(input.F1 / P.F_max, 1) * 100 + '%';
    document.getElementById('mb2').style.width = Math.min(input.F2 / P.F_max, 1) * 100 + '%';
    document.getElementById('mb3').style.width = Math.min(Math.abs(input.Fz) / P.F_vert, 1) * 100 + '%';

    // TARGET
    const dx = target.x - state.x;
    const dy = target.y - state.y;
    const dz = target.z - state.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) / P.SCALE;
    const brg  = Math.atan2(dy, dx) * 180 / Math.PI;

    document.getElementById('dx').textContent = U.format(dx / P.SCALE);
    document.getElementById('dy').textContent = U.format(dy / P.SCALE);
    document.getElementById('dz').textContent = U.format(dz / P.SCALE);
    document.getElementById('brg').textContent = U.format(brg) + '°';

    // SCORE
    document.getElementById('score').textContent = score;
    
    // SYSTEM
    if (timerStarted) {
        // Calculate current time
        const elapsed = (performance.now() - t) / 1000;
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        document.getElementById('time-elapsed').textContent = 'T+' + mm + ':' + ss;
    }
}