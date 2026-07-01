from enum import StrEnum
from typing import Final

class P:
    # Effective mass coefficients (rigid body + added mass)
    m_surge: Final[float] = 0.460 + 0.1091 # effective surge mass [kg]
    m_sway: Final[float] = 0.460 + 0.3120 # effective sway mass [kg]
    m_heave: Final[float] = 0.460 + 0.3120 # effective heave mass [kg]
    Iz: Final[float] = 0.0873 + 0.0197 # effective yaw inertia [kg*m^2]

    # Linear damping coefficients
    Xu: Final[float] = 0.1900 # surge damping [kg/s]
    Yv: Final[float] = 0.7520 # sway damping [kg/s]
    Zw: Final[float] = 0.3366 # heave damping [kg/s]
    Nr: Final[float] = 0.2450 # yaw damping [kg*m^2/s]

    # Actuator geometry
    ly: Final[float] = 0.461 # lateral motor moment arm [m] (Mz = (F_L − F_R) · ly)

    # Ship geometry
    a: Final[float] = 0.918 # x (semi-major) axis [m]
    b: Final[float] = 0.372 # y & z (semi-minor) axes [m]

    # UI constants
    F_step: Final[float] = 0.40 # lateral thrust increment per key press [N]
    F_step_v: Final[float] = 0.50 # vertical thrust increment per key press [N]
    F_max: Final[float] = 0.75 # max motor force [N]

    CAPTURE_RAD: Final[float] = 0.65 # [m]
    SCALE: Final[float] = 80 / 0.918 # [px/m]

class LevelID(StrEnum):
    TUTORIAL = "tutorial"
    LEVEL_01 = "01"
    LEVEL_02 = "02"
    LEVEL_03 = "03"

class Level:
    def __init__(self, id: LevelID, score: int, on_complete: str = "/levels.html"):
        self.id = id
        self.score = score
        self.on_complete = on_complete

class LEVELS:
  TUTORIAL: Final[Level] = Level(LevelID.TUTORIAL, 1)
  L1: Final[Level] = Level(LevelID.LEVEL_01, 3)
  L2: Final[Level] = Level(LevelID.LEVEL_02, 8)
  L3: Final[Level] = Level(LevelID.LEVEL_03, 12)