import math
import constants as P
from models import State, StateDot

__all__ = ["derivatives", "rk4"]

def derivatives(S, inp):
    return StateDot(
        dx = S.u * math.cos(S.psi) - S.v * math.sin(S.psi),
        dy = S.u * math.sin(S.psi) + S.v * math.cos(S.psi),
        dz = S.w,
        dpsi = S.r,
        du = (inp["Fx"] - P.Xu * S.u + P.m_sway * S.v * S.r) / P.m_surge,
        dv = (-P.Yv * S.v - P.m_surge * S.u * S.r) / P.m_sway,
        dw = (inp["Fz"] - P.Zw * S.w) / P.m_heave,
        dr = (inp["Mz"] - P.Nr * S.r) / P.Iz,
    )

def rk4(S, inp, dt=0.025):    
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

    k1 = derivatives(S, inp)
    k2 = derivatives(add(S, k1, dt/2), inp)
    k3 = derivatives(add(S, k2, dt/2), inp)
    k4 = derivatives(add(S, k3, dt), inp)

    # Weighted average of derivatives
    avg_d = {key: (k1[key] + 2*k2[key] + 2*k3[key] + k4[key]) / 6 for key in k1}
    
    return add(S, avg_d, dt)

if __name__ == "__main__":
    print(P.Iz)