from dataclasses import dataclass

from states import ControlInputs, State, Game, Level, Target, Keys
from physics import rk4
from utils import wrap, dist3D
import constants as P

class Simulator:
    def __init__(self, level: Level):
        self.level = level
        self.G = Game(self.level)
        self.S = State()
        self.T = Target()

    # MAIN LOOP
    def step(self, keypress: Keys):
        Fx_left = P.F_step if keypress.left else 0.0
        Fx_right = P.F_step if keypress.right else 0.0

        Fz = ((P.F_step_v if keypress.up else 0.0)
            - (P.F_step_v if keypress.down else 0.0))

        controlInputs = ControlInputs(
            Fx = Fx_left + Fx_right,
            Mz = (Fx_left - Fx_right) * P.ly,
            Fz = Fz
        )

        # Update state
        self.S = rk4(self.S, controlInputs)

        # Wrap heading to [-pi, pi]
        self.S.psi = wrap(self.S.psi)

        # Clamp altitude to be above ground
        if self.S.z < P.b:
            self.S.z = P.b
            self.S.w = max(0.0, self.S.w)

        # Trail Update
        self._update_trail()

        # Capture & win check
        if dist3D(self.S, self.T) < P.CAPTURE_RAD:
            self.G.score += 1
            self.T = Target()

            if self.G.score >= self.level.score_to_win:
                self.G.timer_started = False

        # Return game state to frontend
        return self.serialize()

    # Trail displays last 100 states every 3 frames
    def _update_trail(self):
        if self.G.frame % 3 == 0:
            self.G.trail_x.append(self.S.x)
            self.G.trail_y.append(self.S.y)
            self.G.trail_z.append(self.S.z)

            if len(self.G.trail_x) > 100:
                self.G.trail_x.pop(0)
                self.G.trail_y.pop(0)
                self.G.trail_z.pop(0)
            
            self.G.frame = 0
        self.G.frame += 1

    # OUTPUT
    def serialize(self):
        return {
            "state": {
                "x": self.S.x,
                "y": self.S.y,
                "z": self.S.z,
                "psi": self.S.psi,
                "u": self.S.u,
                "v": self.S.v,
                "w": self.S.w,
                "r": self.S.r,
            },

            "target": {
                "x": self.T.x,
                "y": self.T.y,
                "z": self.T.z,
            },

            "score": self.G.score,

            "trail": {
                "x": self.G.trail_x,
                "y": self.G.trail_y,
                "z": self.G.trail_z,
            }
        }

    # RESET
    def reset(self):
        self.__init__(self.level)