from dataclasses import dataclass, field

@dataclass
class State:
    x: float; y: float; z: float; psi: float
    u: float; v: float; w: float; r: float

@dataclass
class StateDot:
    dx: float; dy: float; dz: float; dpsi: float
    du: float; dv: float; dw: float; dr: float

@dataclass(frozen=True)
class Level:
    score_to_win: int
    on_complete: str

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