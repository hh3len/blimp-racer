/* Physical constants from:
* Sponaugle, Austin Lane, "Reactive Model-Free Control for Underactuated Vehicles Operating in Resource-Constrained Environments" (2025). 
* Graduate Theses, Dissertations, and Problem Reports. 12996. https://researchrepository.wvu.edu/etd/12996
*/
export const P = {
    // Mass coefficients
    m_surge: 0.460 + 0.1091, // effective surge mass [kg]
    m_sway: 0.460 + 0.3120, // effective sway mass [kg]
    m_heave: 0.460 + 0.3120, // effective heave mass [kg]
    Iz: 0.0873 + 0.0197, // effective yaw inertia [kg*m^2]

    // Damping coefficients
    Xu: 0.1900, // surge damping [kg/s]
    Yv: 0.7520, // sway damping [kg/s]
    Zw: 0.3366, // heave damping [kg/s]
    Nr: 0.2450, // yaw damping [kg*m^2/s]
    ly: 0.461, // lateral motor moment arm [m]

    // Ship geometry
    a: 0.918, // x (semi-major) axis [m]
    b: 0.372, // y & z (semi-minor) axes [m]

    // Animation constants
    F_step: 0.4, // lateral thrust per key press [N]
    F_step_v: 0.5, // vertical thrust per key press [N]
    F_max: 0.75, // maximum motor force [N]

    CAPTURE_RAD: 0.65, // [m]
    SCALE: 80 / 0.918, // pixels per meter
};

/** Compute rates of change for each state variable:
 * dx (global X velocity, + is right) = surge * cos(heading) - sway * sin(heading)
 * dy (global Y velocity, + is forward) = -surge * sin(heading) + sway * cos(heading)
 * dz (global Z velocity, + is down) = heave
 * dpsi = yaw velocity
 * du (surge acceleration) = (thrust - drag) / mass
 * dv (sway acceleration) = (drag) / mass
 * dw (heave acceleration) = (thrust - drag) / mass
 * dr (yaw acceleration) = (torque - drag) / inertia
*/
export function derivatives(S, U) {
    return {
        dx: S.u * Math.cos(S.psi) - S.v * Math.sin(S.psi),
        dy: -S.u * Math.sin(S.psi) + S.v * Math.cos(S.psi),
        dz: S.w,
        dpsi: S.r, 
        du: (U.Fx - P.Xu * S.u + P.m_sway * S.v * S.r) / P.m_surge,
        dv: (-P.Yv * S.v - P.m_surge * S.u * S.r) / P.m_sway,
        dw: (U.Fz - P.Zw * S.w) / P.m_heave,
        dr: (U.Mz - P.Nr * S.r) / P.Iz,
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
        v: s.v + t * d.dv,
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
        dv: (k1.dv + 2*k2.dv + 2*k3.dv + k4.dv) / 6,
        dw: (k1.dw + 2*k2.dw + 2*k3.dw + k4.dw) / 6,
        dr: (k1.dr + 2*k2.dr + 2*k3.dr + k4.dr) / 6,
    }, dt);
}