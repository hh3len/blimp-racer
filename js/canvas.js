import {P} from './physics.js';
import {COLOR} from './utils.js';

export const canvasTop = document.getElementById('cvTop');
export const ctxTop = canvasTop.getContext('2d');
export const canvasSide = document.getElementById('cvSide');
export const ctxSide = canvasSide.getContext('2d');

// Let canvas fill element
function resizeCanvases() {
    const topPanel = canvasTop.parentElement;
    const sidePanel = canvasSide.parentElement;
    canvasTop.width = topPanel.clientWidth;
    canvasTop.height = topPanel.clientHeight;
    canvasSide.width = sidePanel.clientWidth;
    canvasSide.height = sidePanel.clientHeight;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Convert m -> px
const va = P.a * P.SCALE;
const vb = P.b * P.SCALE;

export function draw(state, target) {
    // Convert m -> px
    const sx = state.x * P.SCALE;
    const sy = state.y * P.SCALE;
    const sz = state.z * P.SCALE;

    const tx = target.x * P.SCALE;
    const ty = target.y * P.SCALE;
    const tz = target.z * P.SCALE;

    // Flip z-axis
    const canvasZ = canvasSide.height - sz;
    const targetCanvasZ = canvasSide.height - tz;

    // Camera offsets
    const camX = sx - canvasTop.width / 2;
    const camY = sy - canvasTop.height / 2;
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
    drawTarg(ctxTop, tx - camX, ty - camY);
    drawTarg(ctxSide, tx - camX, targetCanvasZ - camZ);
    
    // BLIMP
    // drawBody(ctxTop, sx, sy, state.psi);
    // drawBody(ctxSide, sx, canvasZ, state.psi);

    drawBody(ctxTop, canvasTop.width / 2, canvasTop.height / 2, state.psi);
    drawBody(ctxSide, canvasTop.width / 2, canvasTop.height / 2, state.psi);
}

// Works as intended
function drawGrid(ctx, camX, camY, spacing = va) {

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

        ctx.textAlign = 'left'; ctx.font = '0.8rem Share Tech Mono'; ctx.fillStyle = COLOR.darkG;
        ctx.fillText('GROUND', 5, ctx.canvas.height - camY + 15); 
        
        ctx.restore();
    }
};

// Works as intended
function drawTarg(ctx, px, py) {
    // CIRCLE
    ctx.beginPath();
    ctx.strokeStyle = COLOR.orange;
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

    let length = va;
    ctx == ctxSide ? length = Math.abs(Math.cos(psi)) * va + Math.abs(Math.sin(psi)) * vb : va;

    ctx.beginPath();
    ctx.ellipse(0, 0, length, vb, 0, 0, Math.PI * 2);
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
    ctxTop.ellipse(0, 0, va, vb, 0, -Math.PI/6, Math.PI/6);
    ctxTop.lineTo(va * Math.cos(Math.PI/6), 0);
    ctxTop.closePath();
    ctxTop.fillStyle = COLOR.nose;
    ctxTop.fill();

    // Clip outside of blimp
    (() => {
        ctxTop.save();
        ctxTop.beginPath();
        ctxTop.rect(-canvasTop.width, -canvasTop.height, canvasTop.width * 2, canvasTop.height * 2);
        ctxTop.ellipse(0, 0, va, vb, 0, 0, Math.PI * 2);
        ctxTop.clip("evenodd"); 
    })();

    // L/R fins
    ctxTop.fillStyle = COLOR.fin;
    ctxTop.lineCap = "round";
    ctxTop.strokeStyle = COLOR.grn;
    ctxTop.lineWidth = 1;

    ctxTop.beginPath();
    ctxTop.moveTo(-22, -vb);
    ctxTop.lineTo(-44, -44);
    ctxTop.lineTo(-74, -44);
    ctxTop.lineTo(-75, -11);

    ctxTop.moveTo(-22, vb);
    ctxTop.lineTo(-44, 44);
    ctxTop.lineTo(-74, 44);
    ctxTop.lineTo(-75, 11);
    ctxTop.closePath();

    ctxTop.fill();
    ctxTop.stroke();

    ctxTop.restore();

    // Top fin
    ctxTop.beginPath();
    ctxTop.moveTo(-22, 0);
    ctxTop.lineTo(-73, 0);
    ctxTop.lineTo(-22, -3);
    ctxTop.moveTo(-73, 0);
    ctxTop.lineTo(-22, 3);
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

    const v = va * Math.abs(Math.cos(angle)) + vb * Math.abs(Math.sin(angle)); // Horizontal projection

    // Clip outside of blimp
    (() => {
        ctxSide.save();
        ctxSide.beginPath();
        ctxSide.rect(-canvasSide.width, -canvasSide.height, canvasSide.width * 2, canvasSide.height * 2);
        ctxSide.ellipse(0, 0, v, vb, 0, Math.PI * 2, 0);
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
    drawFin([[-22, 0, vb], [-44, 0, 44], [-74, 0, 44], [-75, 0, 14]]);
    ctxSide.restore();

    // NOSE HIGHLIGHT
    const noseCenterX = v * Math.cos(angle); // X coordinate for tip of nose
    const noseCenterY = 0; // Assuming constant pitch
    const noseRadX = va - va * Math.cos(Math.PI/6); // Calculated using parameter t = Math.PI/6
    const noseRadY = vb * Math.sin(Math.PI/6); // Constant
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
        ctxSide.ellipse(0, 0, v, vb, 0, 0, Math.PI * 2);
        ctxSide.clip();
    })();
    
    // +Y is down (canvas convention), opposite of Cartesian coordinates
    if ((0 <= angle) && (angle <= Math.PI/2)) {
        // drawEllipse(noseLeftX * Math.cos(angle), 0, noseRadY * Math.sin(angle), noseRadY);
    } else if ((Math.PI/2 < angle) && (angle <= Math.PI)) {
        // drawEllipse(-noseRightX * Math.cos(angle), 0, noseRadY * Math.sin(angle), noseRadY, angle);
    }
    
    drawCircle(noseCenterX, noseCenterY, noseRadY);
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

function drawCircle(x, y, r) {
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