import {P} from './physics.js';
import * as U from './utils.js';

export function updateHUD(state, inp, target, score, fps) {
    // VEHICLE
    document.getElementById('sv-x').textContent = U.format(state.x / P.SCALE);
    document.getElementById('sv-y').textContent = U.format(state.y / P.SCALE);
    document.getElementById('sv-z').textContent = U.format(state.z / P.SCALE);
    document.getElementById('sv-psi').textContent = U.format(U.radToDeg(state.psi)) + '°';
    document.getElementById('sv-u').textContent = U.format(state.u);
    document.getElementById('sv-w').textContent = U.format(state.w);
    document.getElementById('sv-r').textContent = U.format(state.r);

    // MOTORS
    document.getElementById('mb1').style.width = Math.min(inp.F1 / P.F_max, 1) * 100 + '%';
    document.getElementById('mb2').style.width = Math.min(inp.F2 / P.F_max, 1) * 100 + '%';
    document.getElementById('mb3').style.width = Math.min(Math.abs(inp.Fz) / P.F_vert, 1) * 100 + '%';

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
}