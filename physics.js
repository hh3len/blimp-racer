import * as D from './draw.js';

/* Physical constants from:
* Sponaugle, Austin Lane, "Reactive Model-Free Control for Underactuated Vehicles Operating in Resource-Constrained Environments" (2025). 
* Graduate Theses, Dissertations, and Problem Reports. 12996. https://researchrepository.wvu.edu/etd/12996
*/
export const P = {
    m_surge: 0.460 + 0.1091, // effective surge mass [kg]
    m_heave: 0.460 + 0.3120, // effective heave mass [kg]
    Iz: 0.0873 + 0.0197, // effective yaw inertia [kg*m^2]
    Xu: 0.1900, // surge damping [kg/s]
    Zw: 0.3366, // heave damping [kg/s]
    Nr: 0.2450, // yaw damping [kg*m^2/s]
    ly: 0.461, // lateral motor moment arm [m]
    F_lat: 0.40, // lateral thrust per key press [N]
    F_vert: 0.55, // vertical thrust per key press [N]
    SCALE: D.canvasSide.height / 2, // pixels per meter
};

/** Compute rates of change for each state variable:
 * dx (global X velocity) = surge * cos(heading)
 * dy (global Y velocity) = surge * sin(heading)
 * dz (global Z velocity) = heave
 * dpsi = yaw velocity
 * du (surge acceleration) = (thrust - drag) / mass
 * dw (heave acceleration) = (thrust - drag) / mass
 * dr (yaw acceleration) = (torque - drag) / inertia
*/

export function derivatives(s, inp) {
    return {
        dx: s.u * Math.cos(s.psi) * P.SCALE,
        dy: s.u * Math.sin(s.psi) * P.SCALE,
        dz: s.w * P.SCALE,
        dpsi: s.r, 
        du: (inp.Fx - P.Xu * s.u) / P.m_surge,
        dw: (inp.Fz - P.Zw * s.w) / P.m_heave,
        dr: (inp.Mz - P.Nr * s.r) / P.Iz,
    };
}

// Runge-Kutta 4th order integrator (RK4)
export function rk4(s, inp, dt = 0.025) {
    const add = (s, d, t) => ({
        ...s,
        x: s.x + t * d.dx,
        y: s.y + t * d.dy,
        z: s.z + t * d.dz,
        psi: s.psi + t * d.dpsi,
        u: s.u + t * d.du,
        w: s.w + t * d.dw,
        r: s.r + t * d.dr,
    });
    
    const k1 = derivatives(s, inp);
    const k2 = derivatives(add(s, k1, dt/2), inp);
    const k3 = derivatives(add(s, k2, dt/2), inp);
    const k4 = derivatives(add(s, k3, dt), inp);

    return add(s, {
        dx: (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) / 6,
        dy: (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy) / 6,
        dz: (k1.dz + 2*k2.dz + 2*k3.dz + k4.dz) / 6,
        dpsi: (k1.dpsi + 2*k2.dpsi + 2*k3.dpsi + k4.dpsi) / 6,
        du: (k1.du + 2*k2.du + 2*k3.du + k4.du) / 6,
        dw: (k1.dw + 2*k2.dw + 2*k3.dw + k4.dw) / 6,
        dr: (k1.dr + 2*k2.dr + 2*k3.dr + k4.dr) / 6,
    }, dt);
}