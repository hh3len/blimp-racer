// Round to d amount of digits (2 by default)
export function format(n, d = 2) {
    return (n >= 0 ? '+' : '') + n.toFixed(d);
}

// Radians to degrees unit conversion
export const radToDeg = rad => (rad * 180 / Math.PI);