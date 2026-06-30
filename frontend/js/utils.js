// Round to (default 2) digits
export function format(n, d = 2) {
    return (n >= 0 ? '+' : '') + n.toFixed(d);
}

// Calculate distance between state & target objects
export const dist = (s, t) => ({
    dx: t.x - s.x,
    dy: t.y - s.y,
    dz: t.z - s.z,
    brg: radToDeg(Math.atan2(s.y - t.y, s.x - t.x)),
    dist2D: Math.hypot(t.x - s.x, t.y - s.y),
    dist3D: Math.hypot(t.x - s.x, t.y - s.y, t.z - s.z)
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