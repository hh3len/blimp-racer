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

// CONVERSION STEPS:
// Canvas-relative origin = (w/2, h/2)
// Canvas-relative point of interest = (w/2 + tx, h/2 - ty)
// Entire canvas shift due to ship motion = ((w/2 + tx) - sx, (h/2 - ty) + sy)

// Convert m -> px
const va = P.a * P.SCALE;
const vb = P.b * P.SCALE;

export function draw(state, target, game) {
    // Convert m -> px
    const sx = state.x * P.SCALE; const sy = state.y * P.SCALE; const sz = state.z * P.SCALE;
    const tx = target.x * P.SCALE; const ty = target.y * P.SCALE; const tz = target.z * P.SCALE;
    const trailX = game.trailX; const trailY = game.trailY; const trailZ = game.trailZ;

    // SET DEFAULT CANVAS STYLES
    let setStyles = ctx => { ctx.lineWidth = 1.5; ctx.strokeStyle = COLOR.grn; ctx.fillStyle = COLOR.body; }
    setStyles(ctxTop); setStyles(ctxSide);

    // CLEAR CANVAS
    let clearCanvas = ctx => { ctx.save(); ctx.fillStyle = COLOR.bg; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); };
    clearCanvas(ctxTop); clearCanvas(ctxSide);

    // ENVIRONMENT (grid, origin, ground, trail)
    drawEnv(ctxTop, sx, sy, trailX, trailY); drawEnv(ctxSide, sx, sz, trailX, trailZ);

    // TARGET
    drawTarg(ctxTop, tx, ty, sx, sy); drawTarg(ctxSide, tx, tz, sx, sz);
    
    // BLIMP
    drawBody(ctxTop, state.psi); drawBody(ctxSide, state.psi);
}

function drawEnv(ctx, sx, sy, trailX, trailY, spacing = va) {
    // Canvas
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Draw origin
    if (ctx == ctxTop) {
        ctx.save(); ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(w/2 - sx - 12, h/2 + sy, 25, 0, 2 * Math.PI);
        ctx.lineTo(w/2 - sx + 12, h/2 + sy, 25, 0, 2 * Math.PI);
        ctx.moveTo(w/2 - sx, h/2 + sy - 12, 25, 0, 2 * Math.PI);
        ctx.lineTo(w/2 - sx, h/2 + sy + 12, 25, 0, 2 * Math.PI);
        ctx.stroke(); ctx.restore();
    }

    // Draw ground 
    if (ctx == ctxSide) {
        const g = h/2 + sy; ctx.save(); ctx.beginPath();
        ctx.moveTo(0, g); ctx.lineTo(w, g); ctx.stroke();
        ctx.fillStyle = COLOR.bg; ctx.fillRect(0, g, w, h);
        ctx.font = '0.8rem Share Tech Mono'; ctx.fillStyle = COLOR.darkG;
        ctx.fillText('GROUND', 5, g + 15); ctx.restore();
    }

    // Draw gridlines
    (() => {
        ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = COLOR.grid;

        // Extend grid values infinitely
        const wrappedX = ((-sx) % spacing + spacing) % spacing;
        const wrappedY = ((sy) % spacing + spacing) % spacing;

        // Vertical lines
        for (let x = wrappedX; x < w; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
        }

        // Horiz lines
        for (let y = wrappedY; y < h; y += spacing) {
            ctx.beginPath(); ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
        }
        ctx.restore();
    }) ();

    // Draw disappearing trail
    (() => {
        // Convert trail m -> px and translate by canvas origin
        const x = trailX.map(i => w/2 + i * P.SCALE);
        const y = trailY.map(i => h/2 - i * P.SCALE);

        ctx.save(); ctx.beginPath(); ctx.strokeStyle = COLOR.grn + '80'; //opacity
        for (let i = 0; i < x.length; i++) {
            const p = { px: x[i] - sx, py: y[i] + sy};
            i === 0 ? ctx.moveTo(p.px,p.py) : ctx.lineTo(p.px,p.py);
        }
        ctx.stroke(); ctx.restore();
    }) ();
};

// Draw target circles
function drawTarg(ctx, tx, ty, sx, sy) {
    // Canvas
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Target conversion
    const px = w/2 + tx - sx;
    const py = h/2 - ty + sy;

    ctx.save();
    // CIRCLE
    ctx.beginPath();
    ctx.strokeStyle = COLOR.orange; ctx.setLineDash([5, 5]);
    ctx.arc(px, py, va / 2, 0, Math.PI * 2); ctx.stroke();
    
    // DIAMOND
    const ds = 8; ctx.beginPath();
    ctx.moveTo(px, py - ds);
    ctx.lineTo(px + ds, py);
    ctx.lineTo(px, py + ds);
    ctx.lineTo(px - ds, py);
    ctx.fillStyle = COLOR.gold; ctx.fill();

    ctx.restore();
};

// save current canvas
// translate
// rotate IFF xy
// begin path to draw ellipse
// drawDetails
// restore

// Draw body of blimp
function drawBody(ctx, psi) {
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx == ctxTop && ctx.rotate(psi);

    let length = va;
    ctx == ctxSide ? length = Math.abs(Math.cos(psi)) * va + Math.abs(Math.sin(psi)) * vb : va;

    ctx.beginPath();
    ctx.ellipse(0, 0, length, vb, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLOR.body;
    ctx.fill();
    ctx.stroke();

    ctx == ctxTop && drawDetailsTop();
    ctx == ctxSide && drawDetailsSide(psi);

    ctx.restore();
}

// Works as intended
function drawDetailsTop() {
    ctxTop.save();
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

    ctxTop.save();
    // Clip outside of blimp
    (() => {
        ctxTop.beginPath();
        ctxTop.rect(-canvasTop.width, -canvasTop.height, canvasTop.width * 2, canvasTop.height * 2);
        ctxTop.ellipse(0, 0, va, vb, 0, 0, Math.PI * 2);
        ctxTop.clip("evenodd"); 
    })();

    // L/R fins
    ctxTop.fillStyle = COLOR.fin;
    ctxTop.lineCap = "round";

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
    ctxTop.restore(); // Ends clip outside of blimp

    // Top fin
    ctxTop.beginPath();
    ctxTop.moveTo(-22, 0);
    ctxTop.lineTo(-73, 0);
    ctxTop.lineTo(-22, -3);
    ctxTop.moveTo(-73, 0);
    ctxTop.lineTo(-22, 3);
    ctxTop.lineWidth = 2.75;
    ctxTop.stroke();

    ctxTop.restore();
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