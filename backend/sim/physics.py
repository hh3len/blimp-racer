import math
from constants import P
from states import State, StateDot

__all__ = ["derivatives", "rk4"]

def derivatives(S, U):
    return StateDot(
        dx = S.u * math.cos(S.psi) - S.v * math.sin(S.psi),
        dy = S.u * math.sin(S.psi) + S.v * math.cos(S.psi),
        dz = S.w,
        dpsi = S.r,
        du = (U.Fx - P.Xu * S.u + P.m_sway * S.v * S.r) / P.m_surge,
        dv = (-P.Yv * S.v - P.m_surge * S.u * S.r) / P.m_sway,
        dw = (U.Fz - P.Zw * S.w) / P.m_heave,
        dr = (U.Mz - P.Nr * S.r) / P.Iz,
    )

def rk4(S, U, dt=0.025):    
    def add(state, deriv, t):
        return State(
            state.x + t * deriv.dx,
            state.y + t * deriv.dy,
            state.z + t * deriv.dz,
            state.psi + t * deriv.dpsi,
            state.u + t * deriv.du,
            state.v + t * deriv.dv,
            state.w + t * deriv.dw,
            state.r + t * deriv.dr
        )

    k1 = derivatives(S, U)
    k2 = derivatives(add(S, k1, dt/2), U)
    k3 = derivatives(add(S, k2, dt/2), U)
    k4 = derivatives(add(S, k3, dt), U)

    avg_d = StateDot(
        dx = (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx) / 6,
        dy = (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy) / 6,
        dz = (k1.dz + 2*k2.dz + 2*k3.dz + k4.dz) / 6,
        dpsi = (k1.dpsi + 2*k2.dpsi + 2*k3.dpsi + k4.dpsi) / 6,
        du = (k1.du + 2*k2.du + 2*k3.du + k4.du) / 6,
        dv = (k1.dv + 2*k2.dv + 2*k3.dv + k4.dv) / 6,
        dw = (k1.dw + 2*k2.dw + 2*k3.dw + k4.dw) / 6,
        dr = (k1.dr + 2*k2.dr + 2*k3.dr + k4.dr) / 6
    )

    return add(S, avg_d, dt)

# if __name__ == "__main__":
#     st = State(0, 0, 0, 0, 1, 0, 0, 0)
#     ci = ControlInputs(1, 0, 0)
#     print(rk4(st, ci))