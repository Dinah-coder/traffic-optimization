import random
import time
from typing import List, Dict

EDGES = [
    ("kicukiro-sonatube", 50, 1.8),
    ("sonatube-gikondo", 45, 1.5),
    ("sonatube-magerwa", 60, 2.0),
    ("gikondo-rwandex", 40, 1.3),
    ("rwandex-nyarugenge", 45, 2.4),
    ("magerwa-remera", 60, 2.3),
    ("remera-kimihurura", 50, 2.0),
    ("kimihurura-downtown", 45, 1.8),
    ("kimihurura-kacyiru", 50, 1.9),
    ("kacyiru-downtown", 55, 2.2),
    ("nyarugenge-downtown", 40, 1.2),
    ("nyabugogo-downtown", 50, 1.5),
]


def generate_traffic_data(peak_hour: bool = False) -> List[Dict]:
    now = int(time.time())
    peak_mult = 1.6 if peak_hour else 0.8
    results = []

    for eid, base_speed, dist in EDGES:
        density = max(5.0, min(100.0, random.gauss(35 * peak_mult, 15)))
        speed = max(8.0, base_speed * (1 - density / 110) + random.gauss(0, 3))
        vehicles = int(density * dist * 0.9)
        flow = int(density * speed * 0.8)

        results.append({
            "edgeId": eid,
            "speed": round(speed, 1),
            "vehicleCount": vehicles,
            "density": round(density, 1),
            "flowRate": flow,
            "timestamp": now,
        })

    return results
