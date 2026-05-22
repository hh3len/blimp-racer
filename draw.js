const canvasTop  = document.getElementById('cvTop');
const ctxTop     = canvasTop.getContext('2d');
const canvasSide = document.getElementById('cvSide');
const ctxSide    = canvasSide.getContext('2d');

// Simulate 2D motion
function draw() {
    // R
    const F1 = keys.right ? P.F_step : 0;
    const F2 = keys.left ? P.F_step : 0;

    const Fz = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
    
    const inp = {
        Fx: F1 + F2,
        Mz: (F1 - F2) * P.ly,
        Fz: Fz * P.F_vert,
    };

    // Compute state
    state = rk4(state, inp, 0.025);

    // clamp to canvas bounds
    state.x = Math.max(55, Math.min(canvasTop.width  - 55, state.x));
    state.y = Math.max(22, Math.min(canvasTop.height - 22, state.y));
    state.z = Math.max(22, Math.min(canvasSide.height - 22, state.z));

    // Display state visually
    const x = state.x;
    const y = state.y;
    const z = state.z;
    const angle = state.psi;

    // Check if captured
    const dx = target.x - x;
    const dy = target.y - y;
    const dz = target.z - z;

    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if (dist < 30) {
        score++;
        target = newTarget();
    }      

    // CLEAR CANVAS
    ctxTop.fillStyle = 'black';
    ctxTop.fillRect(0, 0, canvasTop.width, canvasTop.height);

    ctxSide.fillStyle = 'black';
    ctxSide.fillRect(0, 0, canvasSide.width, canvasSide.height);

    const started = timerStarted;
    const time = startTime;
    // TIMER
    drawTimer(started, time);

    // TARGET
    drawTarget();

    // BLIMP
    ctxTop.save();
    ctxTop.translate(x, y);
    ctxTop.rotate(angle);

    // Body
    ctxTop.beginPath();
    ctxTop.ellipse(0, 0, 55, 22, 0, 0, Math.PI * 2);
    ctxTop.fillStyle = '#209148';
    ctxTop.fill();
    ctxTop.strokeStyle = '#2bff7e';
    ctxTop.lineWidth = 2;
    ctxTop.stroke();

    drawDetailsTop();
    ctxTop.restore();

    // SIDE VIEW — X horizontal, Z vertical

    // Foreshortening!
    const visibleLength = Math.abs(Math.cos(angle)) * 55 + Math.abs(Math.sin(angle)) * 22;

    ctxSide.save();
    ctxSide.translate(x, z);
    ctxSide.beginPath();
    ctxSide.ellipse(0, 0, visibleLength, 22, 0, 0, Math.PI * 2);
    ctxSide.fillStyle = '#209148';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 2;
    ctxSide.stroke();

    drawDetailsSide(angle);
    ctxSide.restore();

    requestAnimationFrame(draw);
}

function drawTimer(timerStarted, startTime) {
    // BACKGROUND
    ctxTop.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctxTop.fillRect(canvasTop.width/2 - 45, 12, 90, 28);

    // SCORE
    ctxTop.fillStyle = '#2bff7e';
    ctxTop.font = '16px monospace';
    ctxTop.textAlign = 'left';
    ctxTop.fillText('SCORE: ' + score, 16, 32);

    // TIMER DEFAULT DISPLAY
    ctxTop.textAlign = 'center';
    ctxTop.fillText('00:00', canvasTop.width/2, 32);

    // TIMER STARTS
    if (timerStarted) {
        // Clear 00:00 display
        ctxTop.fillStyle = 'rgb(0, 0, 0)';
        ctxTop.fillRect(canvasTop.width/2 - 45, 12, 90, 28);

        // Calculate current time
        const elapsed = (performance.now() - startTime) / 1000;
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        
        ctxTop.fillStyle = '#2bff7e';
        ctxTop.fillText(mm + ':' + ss, canvasTop.width/2, 32);
    }
}

function drawTarget() {
    ctxTop.beginPath();
    ctxTop.arc(target.x, target.y, 30, 0, Math.PI * 2);
    ctxTop.strokeStyle = '#ffd426';
    ctxTop.lineWidth = 1.5;
    ctxTop.setLineDash([4, 4]);
    ctxTop.stroke();
    ctxTop.setLineDash([]);

    ctxTop.beginPath();
    const ds = 8;
    ctxTop.moveTo(target.x, target.y - ds);
    ctxTop.lineTo(target.x + ds, target.y);
    ctxTop.lineTo(target.x, target.y + ds);
    ctxTop.lineTo(target.x - ds, target.y);
    ctxTop.closePath();
    ctxTop.fillStyle = '#ffd426';
    ctxTop.fill();

    ctxSide.beginPath();
    ctxSide.arc(target.x, target.z, 30, 0, Math.PI * 2);
    ctxSide.strokeStyle = '#ffd426';
    ctxSide.lineWidth = 1.5;
    ctxSide.setLineDash([4, 4]);
    ctxSide.stroke();
    ctxSide.setLineDash([]);
    
    ctxSide.beginPath();
    ctxSide.moveTo(target.x, target.z - ds);
    ctxSide.lineTo(target.x + ds, target.z);
    ctxSide.lineTo(target.x, target.z + ds);
    ctxSide.lineTo(target.x - ds, target.z);
    ctxSide.closePath();
    ctxSide.fillStyle = '#ffd426';
    ctxSide.fill();
}

function drawDetailsTop() {
    // Nose highlight
    ctxTop.beginPath();
    ctxTop.ellipse(0, 0, 55, 22, 0, -Math.PI / 6, Math.PI / 6);
    ctxTop.lineTo(48, 0);
    ctxTop.closePath();
    ctxTop.fillStyle = '#ccffcc';
    ctxTop.fill();

    // L/R fins
    ctxTop.beginPath();
    ctxTop.moveTo(-38, -16);
    ctxTop.lineTo(-55, -42);
    ctxTop.lineTo(-50, -10);
    ctxTop.moveTo(-38, 16);
    ctxTop.lineTo(-55, 42);
    ctxTop.lineTo(-50, 10);
    ctxTop.closePath();
    ctxTop.fillStyle = '#0e4020';
    ctxTop.fill();
    ctxTop.strokeStyle = '#2bff7e';
    ctxTop.lineWidth = 1;
    ctxTop.stroke();

    // Top fin
    ctxTop.beginPath();
    ctxTop.moveTo(-37, 0);
    ctxTop.lineTo(-65, 0);
    ctxTop.lineTo(-37, -2);
    ctxTop.moveTo(-65, 0);
    ctxTop.lineTo(-37, 2);
    ctxTop.strokeStyle = '#2bff7e';
    ctxTop.lineWidth = 1.5;
    ctxTop.stroke();
}

function drawDetailsSide(angle) {
    const tailX = -Math.cos(angle) * 55;  // tail migrates left/right as blimp turns
    const noseX =  Math.cos(angle) * 48;  // nose highlight migrates opposite direction

    const vl = Math.cos(angle) * 55;  // signed — negative when facing left

    // Draw front-face highlight as the right half of the projected ellipse
    ctxSide.beginPath();
    ctxSide.ellipse(0, 0, Math.abs(vl), 22, 0, -Math.PI/6, Math.PI/6);
    ctxSide.fillStyle = '#ccffcc';
    ctxSide.fill();

    // // Nose highlight slice
    // ctxSide.beginPath();
    // ctxSide.ellipse(0, 0, 55, 22, 0, -Math.PI/6, Math.PI/6);
    // ctxSide.lineTo(48, 0);
    // ctxSide.closePath();
    // ctxSide.fillStyle = '#ccffcc';
    // ctxSide.fill();

    // Top fin — fixed to tail, always sticks straight up
    ctxSide.beginPath();
    ctxSide.moveTo(tailX,       -16);
    ctxSide.lineTo(tailX - 10,  -42);
    ctxSide.lineTo(tailX + 10,  -10);
    ctxSide.closePath();
    ctxSide.fillStyle = '#0e4020';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 1;
    ctxSide.stroke();

    // Horizontal tail fin — fixed to tail, stays flat
    ctxSide.beginPath();
    ctxSide.moveTo(tailX,      0);
    ctxSide.lineTo(tailX - 20, 0);
    ctxSide.lineTo(tailX,     -2);
    ctxSide.moveTo(tailX - 20, 0);
    ctxSide.lineTo(tailX,      2);
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 1.5;
    ctxSide.stroke();
}