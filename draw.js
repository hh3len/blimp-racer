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

    let length = 55;
    ctx == ctxSide ? length = Math.abs(Math.cos(psi)) * 55 + Math.abs(Math.sin(psi)) * 22 : 55;

    ctx.beginPath();
    ctx.ellipse(0, 0, length, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#209148';
    ctx.fill();
    ctx.strokeStyle = '#2bff7e';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx == ctxTop && drawDetailsTop();
    ctx == ctxSide && drawDetailsSide(psi);

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

    SIDEEE(angle);
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
    ctxTop.ellipse(0, 0, 55, 22, 0, -Math.PI/6, Math.PI/6);
    ctxTop.lineTo(48, 0);
    ctxTop.closePath();
    ctxTop.fillStyle = '#ccffcc';
    ctxTop.fill();

    // L/R fins
    ctxTop.beginPath();
    ctxTop.moveTo(-15, -22);
    ctxTop.lineTo(-30, -30);
    ctxTop.lineTo(-51, -30);
    ctxTop.lineTo(-52, -10);
    ctxTop.lineTo(-50, -12);

    ctxTop.moveTo(-15, 22);
    ctxTop.lineTo(-30, 30);
    ctxTop.lineTo(-51, 30);
    ctxTop.lineTo(-52, 10);
    ctxTop.lineTo(-50, 12);

    ctxTop.closePath();
    ctxTop.fillStyle = '#0e4020';
    ctxTop.fill();
    ctxTop.lineCap = "round";
    ctxTop.strokeStyle = '#2bff7e';
    ctxTop.lineWidth = 1;
    ctxTop.stroke();

    // Top fin
    ctxTop.beginPath();
    ctxTop.moveTo(-16, 0);
    ctxTop.lineTo(-50, 0);
    ctxTop.lineTo(-16, -2);
    ctxTop.moveTo(-50, 0);
    ctxTop.lineTo(-16, 2);
    ctxTop.lineWidth = 2.75;
    ctxTop.stroke();
}

// WIP
function ds() {
    function projectSide(point, angle) {
        return {
            px: point.x * Math.cos(angle) - point.y * Math.sin(angle),
            py: -point.z  // negative because canvas Y is flipped
        };
    }

    // Left fin
    const leftFin = [
        { x: -38, y: -16, z: 0 },
        { x: -55, y: -42, z: 0 },
        { x: -50, y: -10, z: 0 },
    ];

    // Right fin
    const rightFin = [
        { x: -38, y:  16, z: 0 },
        { x: -55, y:  42, z: 0 },
        { x: -50, y:  10, z: 0 },
    ];

    // Top fin
    const topFin = [
        { x: -38, y: 0, z:  0  },
        { x: -55, y: 0, z: -30 },
        { x: -50, y: 0, z: -10 },
    ];

    function drawFinSide(points, angle) {
        const projected = points.map(p => projectSide(p, angle));
        ctxSide.beginPath();
        ctxSide.moveTo(projected[0].px, projected[0].py);
        ctxSide.lineTo(projected[1].px, projected[1].py);
        ctxSide.lineTo(projected[2].px, projected[2].py);
        ctxSide.closePath();
        ctxSide.fillStyle = '#0e4020';
        ctxSide.fill();
        ctxSide.strokeStyle = '#2bff7e';
        ctxSide.lineWidth = 1;
        ctxSide.stroke();
    }

    // nose tip in 3D
    const noseTip = projectSide({ x: 55, y: 0, z: 0 }, angle);

    // the visible half-length after foreshortening
    const visibleLength = Math.abs(Math.cos(angle)) * 55;

    ctxSide.beginPath();
    ctxSide.moveTo(0, 0);
    ctxSide.ellipse(0, 0, visibleLength, 22, 0, -Math.PI/6, Math.PI/6);
    ctxSide.lineTo(noseTip.px, 0);
    ctxSide.closePath();
    ctxSide.fillStyle = '#ccffcc';
    ctxSide.fill();
}

function drawDetailsSide(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    function project(x, y, z) {
        return {
            px: x * cos - y * sin,
            py: -z
        };
    }

    // function drawFin(points) {
    //     const p = points.map(([x,y,z]) => project(x, y, z));
    //     ctxSide.beginPath();
    //     ctxSide.moveTo(p[0].px, p[0].py);
    //     ctxSide.lineTo(p[1].px, p[1].py);
    //     ctxSide.lineTo(p[2].px, p[2].py);
    //     ctxSide.closePath();
    //     ctxSide.fillStyle = '#0e4020';
    //     ctxSide.fill();
    //     ctxSide.strokeStyle = '#2bff7e';
    //     ctxSide.lineWidth = 1;
    //     ctxSide.stroke();
    // }

    // // Left fin — flat in Y (horizontal plane)
    // drawFin([[-38, -16, 0], [-55, -42, 0], [-50, -10, 0]]);

    // // Right fin — mirror of left
    // drawFin([[-38,  16, 0], [-55,  42, 0], [-50,  10, 0]]);

    // // Top fin — flat in X (vertical plane), always fully visible from side
    // drawFin([[-38, 0, 0], [-55, 0, -30], [-50, 0, -10]]);

    // Nose highlight
    const visibleLength = Math.abs(cos) * 55;
    const noseTip = project(55, 0, 0);

    const noseTop = project(55 * Math.cos(Math.PI/6), 22 * Math.sin(Math.PI/6), 0);
    const noseBot = project(55 * Math.cos(-Math.PI/6), 22 * Math.sin(-Math.PI/6), 0);
    const noseAvg = (noseTop.px + noseBot.px) / 2;

    // facing right (cos > 0) = positive X
    // facing left  (cos < 0) = negative X 
    const noseAngle = cos >= 0 ? 0 : Math.PI;
  
    ctxSide.beginPath();    
    ctxSide.ellipse(0, 0, visibleLength, 22, 0, 
        noseAngle - Math.PI/6, 
        noseAngle + Math.PI/6
    );
    
    ctxSide.lineTo(noseAvg, 0);
    ctxSide.closePath();

    ctxSide.fillStyle = '#ccffcc';
    ctxSide.fill();
    ctxSide.strokeStyle = '#2bff7e';
    ctxSide.stroke();
}