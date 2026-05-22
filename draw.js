export const canvasTop = document.getElementById('cvTop');
export const ctxTop = canvasTop.getContext('2d');
export const canvasSide = document.getElementById('cvSide');
export const ctxSide = canvasSide.getContext('2d');

// Simulate 2D motion
export function draw(state, target, score, timerStarted, startTime) {
    // CLEAR CANVAS
    let clearCanvas = (canvas) => {
        canvas.getContext('2d').fillStyle = 'black';
        canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
    };
    clearCanvas(canvasTop);
    clearCanvas(canvasSide);

    // TIMER
    drawHeader(ctxTop, timerStarted, startTime, score);
    drawHeader(ctxSide, timerStarted, startTime, score);

    // TARGET
    drawTarg(ctxTop, target.x, target.y);
    drawTarg(ctxSide, target.x, target.z);
    
    // BLIMP
    // drawBlimp(state.x, state.y, state.z, state.psi);

    drawBody(ctxTop, state.x, state.y, state.psi);
    drawBody(ctxSide, state.x, state.z, state.psi);
}

// save current canvas
// translate
// rotate IFF xy
// begin path to draw ellipse
// drawDetails
// restore

// Works as intended
function drawBody(ctx, x, y, psi) {
    ctx.save();
    ctx.translate(x, y);
    ctx == ctxTop && ctx.rotate(psi);

    ctx.beginPath();
    ctx.ellipse(0, 0, 55, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#209148';
    ctx.fill();
    ctx.strokeStyle = '#2bff7e';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawDetailsTop();
    drawDetailsSide(psi);
    ctx.restore();
}

// Works as intended
function drawBlimp(x, y, z, angle) {
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
    ctxSide.translate(x, canvasSide.height - z);
    ctxSide.beginPath();
    ctxSide.ellipse(0, 0, visibleLength, 22, 0, 0, Math.PI * 2);
    ctxSide.fillStyle = '#209148';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 2;
    ctxSide.stroke();

    drawDetailsSide(angle);
    ctxSide.restore();
}

// Works as intended
function drawHeader(ctx, timerStarted, startTime, score) {
    // SCORE
    ctx.fillStyle = '#2bff7e';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + score, 16, 32);

    // TIMER DEFAULT DISPLAY
    ctx.textAlign = 'center';
    ctx.fillText('00:00', canvasTop.width/2, 32);

    // TIMER STARTS
    if (timerStarted) {
        // Clear 00:00 display
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(canvasTop.width/2 - 45, 12, 90, 28);

        // Calculate current time
        const elapsed = (performance.now() - startTime) / 1000;
        const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const ss = String(Math.floor(elapsed % 60)).padStart(2, '0');
        
        ctx.fillStyle = '#2bff7e';
        ctx.fillText(mm + ':' + ss, canvasTop.width/2, 32);
    }
}

// Works as intended
function drawTarg(ctx, px, py) {
    // CIRCLE
    ctx.beginPath();
    ctx.strokeStyle = '#ffd426';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.arc(px, py, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // DIAMOND
    const ds = 8;
    ctx.beginPath();
    ctx.moveTo(px, py - ds);
    ctx.lineTo(px + ds, py);
    ctx.lineTo(px, py + ds);
    ctx.lineTo(px - ds, py);
    ctx.closePath();
    ctx.fillStyle = '#ffd426';
    ctx.fill();
};

// Works as intended
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

// WIP
function drawDetailsSide(angle) {
    const tailX = -Math.cos(angle) * 55;  // tail migrates left/right as blimp turns
    const noseX =  Math.cos(angle) * 48;  // nose highlight migrates opposite direction

    const vl = Math.cos(angle) * 55;  // negative when facing left

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

    // Top finL fixed to tail, always sticks straight up
    ctxSide.beginPath();
    ctxSide.moveTo(tailX, -16);
    ctxSide.lineTo(tailX - 10, -42);
    ctxSide.lineTo(tailX + 10, -10);
    ctxSide.closePath();
    ctxSide.fillStyle = '#0e4020';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 1;
    ctxSide.stroke();

    // Horizontal tail fin: fixed to tail, stays flat
    ctxSide.beginPath();
    ctxSide.moveTo(tailX, 0);
    ctxSide.lineTo(tailX - 20, 0);
    ctxSide.lineTo(tailX, -2);
    ctxSide.moveTo(tailX - 20, 0);
    ctxSide.lineTo(tailX, 2);
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.lineWidth = 1.5;
    ctxSide.stroke();
}