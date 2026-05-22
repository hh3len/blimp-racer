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

    // TIMER
    drawTimer();

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

    drawDetails(ctxTop);
    ctxTop.restore();

    // SIDE VIEW — X horizontal, Z vertical
    ctxSide.save();
    ctxSide.translate(x, z);
    ctxSide.beginPath();
    ctxSide.ellipse(0, 0, 55, 22, 0, 0, Math.PI * 2);
    ctxSide.fillStyle = '#209148';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 2;
    ctxSide.stroke();
    drawDetails(ctxSide);
    ctxSide.restore();

    requestAnimationFrame(draw);
}

function drawTimer() {
    // TIMER
    const elapsed = (performance.now() - startTime) / 1000;
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');

    ctxTop.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctxTop.fillRect(canvasTop.width/2 - 45, 12, 90, 28);
    ctxTop.fillStyle = '#2bff7e';

    ctxTop.font = '16px monospace';
    ctxTop.textAlign = 'center';
    ctxTop.fillText(mm + ':' + ss, canvasTop.width/2, 32);
    ctxTop.textAlign = 'left';

    // SCORE
    ctxTop.fillText('SCORE: ' + score, 16, 32);
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

function drawDetails(context) {
    // Nose highlight (indicates front)
    context.beginPath();
    context.ellipse(0, 0, 55, 22, 0, -Math.PI / 6, Math.PI / 6);
    context.lineTo(48, 0);
    context.closePath();
    context.fillStyle = '#ccffcc';
    context.fill();

    // Top fin for XY,
    context.beginPath();
    context.moveTo(-38, -16);
    context.lineTo(-55, -42);
    context.lineTo(-50, -10);

    if (context == ctxTop) {
        context.moveTo(-38, 16);
        context.lineTo(-55, 42);
        context.lineTo(-50, 10);
    }

    context.closePath();
    context.fillStyle = '#0e4020';
    context.fill();
    context.strokeStyle = '#2bff7e';
    context.lineWidth = 1;
    context.stroke();

    // Top fin
    context.beginPath();
    context.moveTo(-37, 0);
    context.lineTo(-65, 0);
    context.lineTo(-37, -2);
    context.moveTo(-65, 0);
    context.lineTo(-37, 2);
    context.strokeStyle = '#2bff7e';
    context.lineWidth = 1.5;
    context.stroke();
}