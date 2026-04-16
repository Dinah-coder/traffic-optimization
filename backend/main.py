from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from routes.route_engine import find_optimal_routes
from services.traffic_simulator import generate_traffic_data
from models.congestion_model import predict_congestion

app = FastAPI(title="KigaliFlow AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictInput(BaseModel):
    speed: float
    vehicle_count: int
    density: float


class RouteInput(BaseModel):
    start: str
    end: str
    peak_hour: bool = False


@app.get("/api/traffic-data")
def traffic_data(peak: bool = Query(False)):
    return generate_traffic_data(peak_hour=peak)


@app.post("/api/predict")
def predict(input: PredictInput):
    level, confidence, score = predict_congestion(input.speed, input.vehicle_count, input.density)
    return {
        "level": level,
        "confidence": confidence,
        "score": score,
    }


@app.post("/api/route")
def route(input: RouteInput):
    routes = find_optimal_routes(input.start, input.end, input.peak_hour)
    if not routes:
        raise HTTPException(status_code=400, detail="No route found for the selected nodes")
    return {
        "routes": routes,
        "time_saved": routes[0].get("time_saved", 0),
    }


@app.get("/api/analytics")
def analytics():
    return {"avg_wait_time": 14.2, "routes_optimized": 1842, "time_saved_min": 312}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
