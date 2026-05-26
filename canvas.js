import {P} from './physics.js';
import {COLOR} from './colors.js';

export const canvasTop = document.getElementById('cvTop');
export const ctxTop = canvasTop.getContext('2d');

export const canvasSide = document.getElementById('cvSide');
export const ctxSide = canvasSide.getContext('2d');

function resizeCanvases() {
    const topPanel = canvasTop.parentElement;
    const sidePanel = canvasSide.parentElement;
    canvasTop.width = topPanel.clientWidth;
    canvasTop.height  = topPanel.clientHeight;
    canvasSide.width  = sidePanel.clientWidth;
    canvasSide.height = sidePanel.clientHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

export function draw(state, target) {
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

    // Draw origin crosshairs for top view
    if (ctx == ctxTop) {
        // const ox = ctx.canvas.width / 2 - camX - ctx.canvas.width / 2;
        // const oy = ctx.canvas.height / 2 - camY - ctx.canvas.height / 2;
        const ox = -camX;
        const oy = -camY;

        ctx.save();
        ctx.strokeStyle = COLOR.grn;

        ctx.beginPath();
        ctx.moveTo(ox - 12, oy); ctx.lineTo(ox + 12, oy);
        ctx.moveTo(ox, oy - 12); ctx.lineTo(ox, oy + 12);
        ctx.stroke();

        ctx.restore();
    }

    ctx.strokeStyle = COLOR.grid;
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

    // Draw ground
    if (ctx == ctxSide) {
        ctx.save();
       
        ctx.beginPath();
        ctx.moveTo(0, ctx.canvas.height - camY); ctx.lineTo(ctx.canvas.width, ctx.canvas.height - camY);
        ctx.strokeStyle = COLOR.grn;
        ctx.stroke();

        ctx.fillRect(0, ctx.canvas.height - camY, ctx.canvas.width, ctx.canvas.height);

        ctx.textAlign = 'left'; ctx.font = '0.8rem Share Tech Mono'; ctx.fillStyle = COLOR.grnDim;
        ctx.fillText('GROUND', 5, ctx.canvas.height - camY + 15); 
        
        ctx.restore();
    }
};

// Works as intended
function drawTarg(ctx, px, py) {
    // CIRCLE
    ctx.beginPath();
    ctx.strokeStyle = COLOR.org;
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
    ctx.fillStyle = COLOR.gold;
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
    ctx.fillStyle = COLOR.body;
    ctx.fill();
    ctx.strokeStyle = COLOR.grn;
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
    ctxTop.fillStyle = COLOR.nose;
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
    ctxTop.fillStyle = COLOR.fin;
    ctxTop.fill();
    ctxTop.lineCap = "round";
    ctxTop.strokeStyle = COLOR.grn;
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
        ctxSide.fillStyle = COLOR.fin;
        ctxSide.fill();
        ctxSide.strokeStyle = COLOR.grn;
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
    ctxSide.strokeStyle = COLOR.nose;
    ctxSide.stroke();
}

function drawCircle(x, y, r, angle) {
    ctxSide.beginPath();
    ctxSide.arc(x, y, r, 0, Math.PI * 2);
    ctxSide.closePath();
    ctxSide.fillStyle = COLOR.nose;
    ctxSide.fill();

    const gradient = ctxSide.createConicGradient(0, r, r);

    gradient.addColorStop(0, COLOR.nose);
    gradient.addColorStop(0.5, 'white');
    gradient.addColorStop(1, COLOR.nose);

    ctxSide.fillStyle = gradient;
    ctxSide.fill();
}