import random as R
from dataclasses import dataclass, field
from constants import Level

__all__ = ["State", "StateDot", "ControlInputs", "Keys", "Target", "Game"]

@dataclass
class State:
    x: float; y: float; z: float; psi: float
    u: float; v: float; w: float; r: float

@dataclass
class StateDot:
    dx: float; dy: float; dz: float; dpsi: float
    du: float; dv: float; dw: float; dr: float

@dataclass
class ControlInputs:
    Fx: float; Mz: float; Fz: float

@dataclass
class Keys:
    up: bool = False; down: bool = False
    left: bool = False; right: bool = False

@dataclass
class Target:
    x: float = R.random() - 0.5 * 6; y: float = R.random() - 0.5 * 6; z: float = R.random() * 3 + 0.5

@dataclass
class Game:
    level: Level
    score: int = 0

    timer_started: bool = False
    start_time: float | None = None

    trail_x: list[float] = field(default_factory=list)
    trail_y: list[float] = field(default_factory=list)
    trail_z: list[float] = field(default_factory=list)
    frame: int = 0