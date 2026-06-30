import math 

def wrap(psi):
    return (psi + math.pi) % (2 * math.pi) - math.pi

def dist3D(S, T):
    dx = S.x - T.x
    dy = S.y - T.y
    dz = S.z - T.z
    return math.sqrt(dx*dx + dy*dy + dz*dz)