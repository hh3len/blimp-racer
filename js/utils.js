// Round to (default 2) digits
export function format(n, d = 2) {
    return (n >= 0 ? '+' : '') + n.toFixed(d);
}

// // Calculate distance between 2 points
// export const distBtwn = (p1, p2) => {
//     let sum = 0;
//     for (let i in p1) { 
//         sum += (p1[i] - p2[i]) ** 2; 
//     }
//     return Math.sqrt(sum);
// }

// Calculate distance between state & target objects
export const dist = (s, t) => ({
    dx: t.x - s.x,
    dy: t.y - s.y,
    dz: t.z - s.z,
    brg: radToDeg(Math.atan2(t.y - s.y, t.x - s.x)),
    dist2D: Math.sqrt((t.x - s.x) ** 2 + (t.y - s.y) ** 2),
    dist: Math.sqrt((t.x - s.x) ** 2 + (t.y - s.y) ** 2 + (t.z - s.z) ** 2)
})

// Radians to degrees unit conversion
export const radToDeg = rad => rad * 180 / Math.PI;

// Color palette
export const COLOR = {
    grn: '#2bff7e',
    bg: '#050e06',
    grid: '#0e2a12',
    body: '#209148',
    nose: '#ccffcc',
    fin: '#104d25',
    
    darkG: '#1a7040',
    orange: '#ff9920',
    red: '#ff3a3a',
    gold: '#ffd426',
};