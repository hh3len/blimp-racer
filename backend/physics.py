import math
from types import SimpleNamespace
from dataclasses import dataclass

__all__ = ["P", "State", "Input", "derivatives", "rk4"]

# Physical constants
P = SimpleNamespace(
    # Effective mass coefficients (rigid body + added mass)
    m_surge = 0.460 + 0.1091, # effective surge mass [kg]
    m_sway = 0.460 + 0.3120, # effective sway mass [kg]
    m_heave = 0.460 + 0.3120, # effective heave mass [kg]
    Iz = 0.0873 + 0.0197, # effective yaw inertia [kg*m^2]

    # Linear damping coefficients
    Xu = 0.1900, # surge damping [kg/s]
    Yv = 0.7520, # sway damping [kg/s]
    Zw = 0.3366, # heave damping [kg/s]
    Nr = 0.2450, # yaw damping [kg*m^2/s]

    # Actuator geometry
    ly = 0.461, # lateral motor moment arm [m] (Mz = (F_L − F_R) · ly)

    # Ship geometry
    a = 0.918, # x (semi-major) axis [m]
    b = 0.372, # y & z (semi-minor) axes [m]

    # UI constants
    F_step = 0.40, # lateral thrust increment per key press [N]
    F_step_v = 0.50, # vertical thrust increment per key press [N]
    F_max = 0.75, # max motor force [N]

    CAPTURE_RAD = 0.65, # [m]
    SCALE = 80 / 0.918 # [px/m]
)

@dataclass
class State:
    x: float; y: float; z: float; psi: float
    u: float; v: float; w: float; r: float

def derivatives(S, inp):
    return {
        "dx": S.u * math.cos(S.psi) - S.v * math.sin(S.psi),
        "dy": S.u * math.sin(S.psi) + S.v * math.cos(S.psi),
        "dz": S.w,
        "dpsi": S.r,
        "du": (inp["Fx"] - P.Xu * S.u + P.m_sway * S.v * S.r) / P.m_surge,
        "dv": (-P.Yv * S.v - P.m_surge * S.u * S.r) / P.m_sway,
        "dw": (inp["Fz"] - P.Zw * S.w) / P.m_heave,
        "dr": (inp["Mz"] - P.Nr * S.r) / P.Iz,
    }

def rk4(S, inp, dt=0.025):    
    def add(state, deriv, t):
        return State(
            state.x + t * deriv["dx"],
            state.y + t * deriv["dy"],
            state.z + t * deriv["dz"],
            state.psi + t * deriv["dpsi"],
            state.u + t * deriv["du"],
            state.v + t * deriv["dv"],
            state.w + t * deriv["dw"],
            state.r + t * deriv["dr"]
        )

    k1 = derivatives(S, inp)
    k2 = derivatives(add(S, k1, dt/2), inp)
    k3 = derivatives(add(S, k2, dt/2), inp)
    k4 = derivatives(add(S, k3, dt), inp)

    # Weighted average of derivatives
    avg_d = {key: (k1[key] + 2*k2[key] + 2*k3[key] + k4[key]) / 6 for key in k1}
    
    return add(S, avg_d, dt)