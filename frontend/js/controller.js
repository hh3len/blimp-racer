import { P } from './physics.js';
import { wrapAngle } from './utils.js';

/* Autopilot for the autonomous "leader" blimp (level 2).
 * Reuses the exact same rk4/derivatives model as the player blimp —
 * this just produces {Fx, Mz, Fz} inputs to feed into rk4(), the same
 * way keyboard input does for the player.
 */
export const CONTROLLER = {
    KP_PSI: 3.0,        // heading proportional gain [N*m/rad]
    KP_DIST: 0.35,       // forward-thrust proportional gain [N/m]
    KP_Z: 0.6,            // vertical-thrust proportional gain [N/m]
    F_MAX: 0.6,           // max continuous thrust (leader isn't step-limited like the player) [N]
    WAYPOINT_RAD: 0.5,    // [m] distance at which a new waypoint is picked
    RANGE_XY: 8,           // [m] waypoints spawn within +/- this range in x/y
    RANGE_Z: [0.5, 3.5],  // [m] waypoint altitude range
};

// Pick a new random waypoint for the leader to fly toward
export function newWaypoint() {
    return {
        x: (Math.random() - 0.5) * 2 * CONTROLLER.RANGE_XY,
        y: (Math.random() - 0.5) * 2 * CONTROLLER.RANGE_XY,
        z: CONTROLLER.RANGE_Z[0] + Math.random() * (CONTROLLER.RANGE_Z[1] - CONTROLLER.RANGE_Z[0]),
    };
}

/** Simple proportional autopilot: steer & thrust toward a waypoint.
 * Returns rk4-compatible inputs {Fx, Mz, Fz} plus a `reached` flag.
 */
export function leaderControl(state, waypoint) {
    const dx = waypoint.x - state.x;
    const dy = waypoint.y - state.y;
    const dz = waypoint.z - state.z;
    const dist2D = Math.hypot(dx, dy);

    // Desired heading. Matches physics.js's convention: dx = u*cos(psi), dy = -u*sin(psi)
    const desiredPsi = Math.atan2(-dy, dx);
    const headingErr = wrapAngle(desiredPsi - state.psi);

    // Steer toward the waypoint
    const Mz = CONTROLLER.KP_PSI * headingErr;

    // Taper forward thrust while turning so the leader doesn't strafe sideways
    const alignment = Math.max(0, Math.cos(headingErr));
    const Fx = Math.min(CONTROLLER.KP_DIST * dist2D * alignment, CONTROLLER.F_MAX);

    // Vertical thrust is heading-independent
    const Fz = Math.max(-CONTROLLER.F_MAX, Math.min(CONTROLLER.F_MAX, CONTROLLER.KP_Z * dz));

    return { Fx, Mz, Fz, reached: dist2D < CONTROLLER.WAYPOINT_RAD };
}