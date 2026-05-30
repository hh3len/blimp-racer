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

// World-to-canvas coordinate convention:
// canvas_x =  world_x * SCALE 
// canvas_y = -world_y * SCALE (Flip y)
// canvas_z = -world_z * SCALE (Flip z)

// Convert m -> px
const va = P.a * P.SCALE;
const vb = P.b * P.SCALE;

export function draw(state, target, game) {
    // Convert m -> px
    const sx = state.x * P.SCALE;
    const sy = state.y * P.SCALE;
    const sz = state.z * P.SCALE;

    const tx = target.x * P.SCALE;
    const ty = target.y * P.SCALE;
    const tz = target.z * P.SCALE;

    // Flip axes; canvas +y = down
    const canvasY = canvasTop.height - sy;
    const targetCanvasY = canvasTop.height - ty;
    const canvasZ = canvasSide.height - sz;
    const targetCanvasZ = canvasSide.height - tz;

    // Default canvas styles
    ctxTop.lineWidth = 1.5; ctxTop.strokeStyle = COLOR.grn;
    ctxTop.fillStyle = COLOR.body;
    ctxSide.lineWidth = 1.5; ctxSide.strokeStyle = COLOR.grn;
    ctxSide.fillStyle = COLOR.body;

    // Camera offsets: vehicle-relative view
    // Canvas shifts by the blimp's position, camX = "how far world scrolled in x"
    // To draw the world pixel position px, subtract camX from it

    const camX = sx - canvasTop.width / 2;
    const camY = canvasY - canvasTop.height / 2;
    const camZ = canvasZ - canvasSide.height / 2;

    // CLEAR CANVAS
    let clearCanvas = ctx => { ctx.fillStyle = COLOR.bg; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); };
    clearCanvas(ctxTop); clearCanvas(ctxSide);

    // GRID
    drawGrid(ctxTop, sx, sy, camX, camY);
    drawGrid(ctxSide, sx, sz, camX, camZ);

    // TRAIL
    // drawTrail(ctxTop, game.trailX, game.trailY, camX, camY, game);
    // drawTrail(ctxSide, game.trailX, game.trailZ, camX, camZ, game);
    // drawTrail(ctxTop, game.trailX, game.trailY, camX, camY);
    // drawTrail(ctxSide, game.trailX, game.trailZ, camX, camZ);

    // TARGET
    drawTarg(ctxTop, tx - camX, targetCanvasY - camY);
    drawTarg(ctxSide, tx - camX, targetCanvasZ - camZ);
    
    // BLIMP
    drawBody(ctxTop, state.psi);
    drawBody(ctxSide, state.psi);
}

// // Working!
// function drawTrail(ctx, trailX, trailY, offsetx, offsety, g) {
//     const w = ctx.canvas.width;
//     const h = ctx.canvas.height;

//     if (trailX.length < 5) return;

//     // Convert m -> px
//     const x = trailX.map(i => i * P.SCALE);
//     const y = trailY.map(i => -i * P.SCALE);

//     ctx.strokeStyle = COLOR.grn + '80'; // Add opacity
//     ctx.beginPath();

//     // Add camera translation
//     for (let i = 0; i < x.length; i++) {
//         const p = { px: x[i] - offsetx, py: y[i] + offsety };
//         i === 0 ? ctx.moveTo(p.px,p.py) : ctx.lineTo(p.px,p.py);
//     }
    
//     ctx.stroke();
// }

function drawTrail(ctx, trailX, trailY, camA, camB) {
    // const camY = sy - canvasSide.height / 2;
    // const camZ = canvasZ - canvasSide.height / 2;

    const w = ctx.canvas.width / 2;
    let h = ctx.canvas.height / 2; // except for z it'll be +1m 
    ctx === ctxTop ? h = h: h = ctx.canvas.height / 2 + P.SCALE; // except for z it'll be +1m 

    // Convert m -> px
    const x = trailX.map(i => i * P.SCALE);
    const y = trailY.map(i => i * P.SCALE);

    ctx.strokeStyle = COLOR.grn;
    ctx.beginPath();

    // Add camera translation
    for (let i = 0; i < x.length; i++) {
        const p = { px: x[i] - camA, py: y[i] - camB};
        i === 0 ? ctx.moveTo(p.px,p.py) : ctx.lineTo(p.px,p.py);
    }
    
    ctx.stroke();
}

function drawGrid(ctx, sx, sy, camX, camY, spacing = va) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // Draw origin crosshairs
    (() => {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w/2 - sx - 12, h/2 + sy, 25, 0, 2 * Math.PI);
        ctx.lineTo(w/2 - sx + 12, h/2 + sy, 25, 0, 2 * Math.PI);
        ctx.moveTo(w/2 - sx, h/2 + sy - 12, 25, 0, 2 * Math.PI);
        ctx.lineTo(w/2 - sx, h/2 + sy + 12, 25, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }) ();

    ctx.save();
    ctx.lineWidth = 1; ctx.strokeStyle = COLOR.grid;

    // Extend grid values infinitely
    const wrappedX = ((-sx) % spacing + spacing) % spacing;
    const wrappedY = ((sy) % spacing + spacing) % spacing;

    // Vertical lines
    for (let x = wrappedX; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }

    // Horiz lines
    for (let y = wrappedY; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();

    // Draw ground //camY = canvasY - h / 2; //canvasY = h - sy;
    // camY = h - sy - h/2 = h/2 - sy
    // h - camY = h - h/2 + sy = h/2 + sy

    if (ctx == ctxSide) {
        ctx.save();
       
        ctx.beginPath();
        ctx.moveTo(0, h/2 + sy); ctx.lineTo(w, h - camY);
        ctx.stroke();

        ctx.fillRect(0, h - camY, w, h);

        ctx.textAlign = 'left'; ctx.font = '0.8rem Share Tech Mono'; ctx.fillStyle = COLOR.grnDim;
        ctx.fillText('GROUND', 5, h - camY + 15); 
        
        ctx.restore();
    }
};

// Draw target circles
function drawTarg(ctx, px, py) {
    ctx.save();
    // CIRCLE
    ctx.beginPath();
    ctx.strokeStyle = COLOR.orange;
    ctx.setLineDash([5, 5]);
    ctx.arc(px, py, va / 2, 0, Math.PI * 2);
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