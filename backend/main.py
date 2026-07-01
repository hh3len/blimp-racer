from fastapi import FastAPI
from backend.sim.sim import Simulator
import backend.sim.constants as LEVELS

app = FastAPI()

sim = Simulator(LEVELS["01"])

@app.post("/step")
def step(inp: dict):
    return sim.step(inp)

@app.post("/reset")
def reset():
    sim.reset()