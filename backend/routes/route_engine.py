import heapq
from typing import Dict, List, Optional, Set

from services.traffic_simulator import generate_traffic_data
from models.congestion_model import predict_congestion

NODES = {
    "kicukiro": (780, 560),
    "sonatube": (700, 490),
    "gikondo": (600, 520),
    "magerwa": (720, 400),
    "rwandex": (560, 430),
    "nyabugogo": (340, 280),
    "kimihurura": (520, 300),
    "remera": (680, 260),
    "kacyiru": (560, 180),
    "nyarugenge": (380, 400),
    "downtown": (440, 340),
}

EDGES = [
    ("kicukiro", "sonatube", 1.8, 50, "kicukiro-sonatube"),
    ("sonatube", "gikondo", 1.5, 45, "sonatube-gikondo"),
    ("sonatube", "magerwa", 2.0, 60, "sonatube-magerwa"),
    ("gikondo", "rwandex", 1.3, 40, "gikondo-rwandex"),
    ("rwandex", "nyarugenge", 2.4, 45, "rwandex-nyarugenge"),
    ("magerwa", "remera", 2.3, 60, "magerwa-remera"),
    ("remera", "kimihurura", 2.0, 50, "remera-kimihurura"),
    ("kimihurura", "downtown", 1.8, 45, "kimihurura-downtown"),
    ("kimihurura", "kacyiru", 1.9, 50, "kimihurura-kacyiru"),
    ("kacyiru", "downtown", 2.2, 55, "kacyiru-downtown"),
    ("nyarugenge", "downtown", 1.2, 40, "nyarugenge-downtown"),
    ("nyabugogo", "downtown", 1.5, 50, "nyabugogo-downtown"),
]


def build_graph():
    graph = {node: [] for node in NODES}
    for a, b, dist, speed, eid in EDGES:
        graph[a].append({"to": b, "distance": dist, "base_speed": speed, "edge_id": eid})
        graph[b].append({"to": a, "distance": dist, "base_speed": speed, "edge_id": eid})
    return graph


def heuristic(a: str, b: str) -> float:
    ax, ay = NODES[a]
    bx, by = NODES[b]
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5 / 60


def edge_weight(distance: float, base_speed: float, traffic: Optional[Dict] = None, penalty: float = 1.0) -> float:
    speed = traffic["speed"] if traffic and "speed" in traffic else base_speed
    time_min = (distance / max(8.0, speed)) * 60.0
    if traffic:
        pred = predict_congestion(speed, traffic.get("vehicleCount", 20), traffic.get("density", 30))
        time_min *= 1.0 + pred[2] / 100.0
    return time_min * penalty


def a_star(start: str, goal: str, traffic: Dict[str, Dict], avoid_edges: Set[str] = None) -> Optional[List[str]]:
    if avoid_edges is None:
        avoid_edges = set()

    graph = build_graph()
    open_set = [(0.0, start)]
    came_from: Dict[str, str] = {}
    g_score = {node: float('inf') for node in NODES}
    g_score[start] = 0.0
    f_score = {node: float('inf') for node in NODES}
    f_score[start] = heuristic(start, goal)

    visited = set()
    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = [current]
            while current in came_from:
                current = came_from[current]
                path.append(current)
            return list(reversed(path))

        if current in visited:
            continue
        visited.add(current)

        for edge in graph[current]:
            if edge["edge_id"] in avoid_edges:
                continue
            tentative = g_score[current] + edge_weight(edge["distance"], edge["base_speed"], traffic.get(edge["edge_id"]))
            if tentative < g_score[edge["to"]]:
                came_from[edge["to"]] = current
                g_score[edge["to"]] = tentative
                f_score[edge["to"]] = tentative + heuristic(edge["to"], goal)
                heapq.heappush(open_set, (f_score[edge["to"]], edge["to"]))

    return None


def score_route(path: List[str], traffic: Dict[str, Dict]) -> Dict:
    edge_ids = []
    total_distance = 0.0
    total_time = 0.0
    weighted_speed = 0.0
    total_congestion = 0.0

    for i in range(len(path) - 1):
        a = path[i]
        b = path[i + 1]
        edge = next((e for e in EDGES if (e[0] == a and e[1] == b) or (e[0] == b and e[1] == a)), None)
        if not edge:
            continue
        edge_ids.append(edge[4])
        traffic_point = traffic.get(edge[4], {})
        speed = traffic_point.get("speed", edge[3])
        total_distance += edge[2]
        total_time += edge_weight(edge[2], edge[3], traffic_point)
        weighted_speed += speed * edge[2]
        pred = predict_congestion(speed, traffic_point.get("vehicleCount", 20), traffic_point.get("density", 30))
        total_congestion += pred[2] * edge[2]

    average_speed = round(weighted_speed / max(total_distance, 0.1), 1)
    return {
        "edgeIds": edge_ids,
        "distance": round(total_distance, 1),
        "travelTime": round(total_time, 1),
        "avgSpeed": average_speed,
        "congestionScore": round(total_congestion / max(total_distance, 0.1), 1),
    }


def make_route_result(path: List[str], traffic: Dict[str, Dict], label: str, route_id: str) -> Dict:
    scored = score_route(path, traffic)
    return {
        "id": route_id,
        "label": label,
        "path": path,
        **scored,
    }


def find_optimal_routes(start: str, end: str, peak_hour: bool = False) -> List[Dict]:
    traffic_data = generate_traffic_data(peak_hour=peak_hour)
    traffic_map = {item["edgeId"]: item for item in traffic_data}

    optimal_path = a_star(start, end, traffic_map)
    if not optimal_path:
        return []

    routes = [make_route_result(optimal_path, traffic_map, "Optimal (AI Recommended)", "r1")]

    worst_edge = None
    highest_score = -1.0
    for edge_id in routes[0]["edgeIds"]:
        td = traffic_map.get(edge_id)
        if not td:
            continue
        pred = predict_congestion(td["speed"], td["vehicleCount"], td["density"])
        if pred[2] > highest_score:
            highest_score = pred[2]
            worst_edge = edge_id

    alternatives = []
    if worst_edge:
        alt1_path = a_star(start, end, traffic_map, {worst_edge})
        if alt1_path and alt1_path != optimal_path:
            alternatives.append(make_route_result(alt1_path, traffic_map, "Alternative Route A", "r2"))

    if len(routes[0]["edgeIds"]) >= 2:
        avoid_set = {routes[0]["edgeIds"][0], routes[0]["edgeIds"][1]}
        alt2_path = a_star(start, end, traffic_map, avoid_set)
        if alt2_path and alt2_path != optimal_path and alt2_path != (alternatives[0]["path"] if alternatives else None):
            alternatives.append(make_route_result(alt2_path, traffic_map, "Alternative Route B", "r3"))

    routes.extend(alternatives)
    if len(routes) > 1:
        time_saved = max(0.0, routes[-1]["travelTime"] - routes[0]["travelTime"])
        routes[0]["time_saved"] = round(time_saved, 1)

    return routes
