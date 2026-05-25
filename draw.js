import {P} from './physics.js';

export const canvasTop = document.getElementById('cvTop');
export const ctxTop = canvasTop.getContext('2d');

export const canvasSide = document.getElementById('cvSide');
export const ctxSide = canvasSide.getContext('2d');

// Simulate 2D motion
export function draw(state, target, score, timerStarted, startTime) {
    // Flip z-axis
    const canvasZ = canvasSide.height - state.z;
    const targetCanvasZ = canvasSide.height - target.z;

    // Camera offsets
    const camX = state.x - canvasTop.width / 2;
    const camY = state.y - canvasTop.height / 2;
    const camZ = canvasZ - canvasSide.height / 2;

    // CLEAR CANVAS
    let clearCanvas = (ctx) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    clearCanvas(ctxTop);
    clearCanvas(ctxSide);

    // GRID
    drawGrid(ctxTop, camX, camY);
    drawGrid(ctxSide, camX, camZ);

    // TIMER
    drawHeader(ctxTop, timerStarted, startTime, score, state);
    drawHeader(ctxSide, timerStarted, startTime, score, state);

    // TARGET
    drawTarg(ctxTop, target.x - camX, target.y - camY);
    drawTarg(ctxSide, target.x - camX, targetCanvasZ - camZ);
    
    // BLIMP
    // drawBody(ctxTop, state.x, state.y, state.psi);
    // drawBody(ctxSide, state.x, canvasZ, state.psi);

    drawBody(ctxTop, canvasTop.width / 2, canvasTop.height / 2, state.psi);
    drawBody(ctxSide, canvasTop.width / 2, canvasTop.height / 2, state.psi);
}

// Works as intended
function drawGrid(ctx, camX, camY, spacing = 50) {
    ctx.strokeStyle = '#0e2a12';
    ctx.lineWidth = 0.8;

    // Extend grid values infinitely
    const wrappedX = ((-camX) % spacing + spacing) % spacing;
    const wrappedY = ((-camY) % spacing + spacing) % spacing;

    // Vertical lines
    for (let x = wrappedX; x < ctx.canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }

    // Horiz lines
    for (let y = wrappedY; y < ctx.canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
};

// Works as intended
function drawHeader(ctx, timerStarted, startTime, score, state) {
    // SCORE
    ctx.fillStyle = '#2bff7e';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE: ' + score, 16, 32);

    // HEADING & POSITION
    ctx.textAlign = 'right';
    const radToDeg = rad => rad * 180 / Math.PI;

    ctx.fillText('HEADING: ' + radToDeg(state.psi).toFixed(2) + "º", canvasTop.width - 16, 32);
    ctx.fillText('X: ' + state.x.toFixed(0), canvasTop.width - 16, 52);
    ctx.fillText('Y: ' + state.y.toFixed(0), canvasTop.width - 16, 72);
    ctx.fillText('Z: ' + state.z.toFixed(0), canvasTop.width - 16, 92);
    ctx.fillText('ALTITUDE: ' + (state.z / P.SCALE).toFixed(2) + 'm', canvasTop.width - 16, canvasTop.height - 16);

    // TIMER DEFAULT DISPLAY
    ctx.textAlign = 'center';
    ctx.fillText('00:00', canvasTop.width / 2, 32);

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
function drawDetailsTop() {
    // Nose highlight
    ctxTop.beginPath();

    // ellipse() is parametric!
    // x = a * cos(t)
    // y = b * sin(t)
    ctxTop.ellipse(0, 0, 55, 22, 0, -Math.PI/6, Math.PI/6);
    ctxTop.lineTo(55 * Math.cos(Math.PI/6), 0);
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
function drawDetailsSide(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    function project(x, y, z) {
        return {
            px: x * cos - y * sin,
            py: -z
        };
    }

    const v = 55 * Math.abs(Math.cos(angle)) + 22 * Math.abs(Math.sin(angle)); // Horizontal projection

    // Clip outside of blimp
    (() => {
        ctxSide.save();
        ctxSide.beginPath();
        ctxSide.rect(-canvasSide.width/2, -canvasSide.height, canvasSide.width, canvasSide.height);
        ctxSide.ellipse(0, 0, v, 22, 0, Math.PI * 2, 0);
        ctxSide.clip("evenodd"); 
    })();

    function drawFin(points) {
        const p = points.map(([x,y,z]) => project(x, y, z));
        
        ctxSide.beginPath();
        ctxSide.moveTo(p[0].px, p[0].py);
        p.shift();

        for (let i in p) {
            ctxSide.lineTo(p[i].px, p[i].py);
        }

        ctxSide.closePath();
        ctxSide.fillStyle = '#0e4020';
        ctxSide.fill();
        ctxSide.strokeStyle = '#2bff7e';
        ctxSide.stroke();
    }

    // TOP FIN
    drawFin([[-15, 0, 22], [-30, 0, 30], [-51, 0, 30], [-52, 0, 10]]);

    ctxSide.restore();

    // NOSE HIGHLIGHT
    const noseCenterX = v * Math.cos(angle); // X coordinate for tip of nose
    const noseCenterY = 0; // Assuming constant pitch
    const noseRadX = 55 - 55 * Math.cos(Math.PI/6); // Calculated using parameter t = Math.PI/6
    const noseRadY = 22 * Math.sin(Math.PI/6); // Constant
    
    const noseLeftX = noseCenterX - noseRadX;
    const noseRightX = noseCenterX + noseRadX;
    
    // // Draw hull ellipse spanning both shapes
    // const ellipseCenterX = noseLeftX * cos;
    // const circleLeftEdge = noseCenterX - noseRadX;
    // const circleRightEdge = noseCenterX + noseRadX;
    // const ellipseLeftEdge  = ellipseCenterX - noseRadY * Math.abs(sin);
    // const ellipseRightEdge  = ellipseCenterX + noseRadY * Math.abs(sin);
    
    // Clip to blimp!
    (() => {
        ctxSide.save();
        ctxSide.beginPath();
        ctxSide.ellipse(0, 0, v, 22, 0, 0, Math.PI * 2);
        ctxSide.clip();
    })();
    
    // +Y is down (canvas convention), opposite of Cartesian coordinates
    if ((0 <= angle) && (angle <= Math.PI/2)) {
        // drawEllipse(noseLeftX * Math.cos(angle), 0, noseRadY * Math.sin(angle), noseRadY);
        drawCircle(noseCenterX, noseCenterY, noseRadX, angle);
    } else if ((Math.PI/2 < angle) && (angle <= Math.PI)) {
        // drawEllipse(-noseRightX * Math.cos(angle), 0, noseRadY * Math.sin(angle), noseRadY, angle);
        drawCircle(noseCenterX, noseCenterY, noseRadX, angle);
    }

    ctxSide.restore();
}

function drawEllipse(x, y, a, b) {
    ctxSide.beginPath();
    ctxSide.ellipse(x, y, a, b, 0, 0, Math.PI * 2);
    ctxSide.closePath();
    ctxSide.fillStyle = '#ccffccc0';
    ctxSide.fill();
    ctxSide.strokeStyle = '#ccffcc';
    ctxSide.stroke();
}

function drawCircle(x, y, r, angle) {
    ctxSide.beginPath();
    ctxSide.arc(x, y, r, 0, Math.PI * 2);
    ctxSide.closePath();
    ctxSide.fillStyle = '#ccffcc';
    ctxSide.fill();

    const gradient = ctxSide.createConicGradient(0, r, r);

    gradient.addColorStop(0, "#ccffcc");
    gradient.addColorStop(0.5, "#ffffff");
    gradient.addColorStop(1, "#ccffcc");

    ctxSide.fillStyle = gradient;
    ctxSide.fill();
}