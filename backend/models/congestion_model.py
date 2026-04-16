import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODEL_PATH = "models/congestion_rf.pkl"


def generate_training_data(n=2000, seed=42):
    rng = np.random.default_rng(seed)
    density = rng.uniform(5, 100, n)
    noise = rng.normal(0, 3, n)
    speed = np.clip(60 * (1 - density / 110) + noise, 5, 65)
    vehicles = (density * rng.uniform(0.5, 1.2, n)).astype(int)

    score = 0.55 * (density / 100) + 0.35 * (1 - speed / 60) + 0.10 * (vehicles / 60)
    labels = np.where(score < 0.35, "low", np.where(score < 0.65, "medium", "high"))

    return pd.DataFrame({
        "speed": speed,
        "vehicle_count": vehicles,
        "density": density,
        "label": labels,
    })


_model = None

def _load_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            _model = train_model()
    return _model


def train_model():
    df = generate_training_data()
    X = df[["speed", "vehicle_count", "density"]]
    y = df["label"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    clf = RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42)
    clf.fit(X_train, y_train)
    print(classification_report(y_test, clf.predict(X_test)))

    os.makedirs("models", exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    return clf


def predict_congestion(speed: float, vehicle_count: int, density: float):
    clf = _load_model()
    X = np.array([[speed, vehicle_count, density]])
    probs = clf.predict_proba(X)[0]
    label = clf.predict(X)[0]
    confidence = float(max(probs))
    score = float(0.55 * density + 0.35 * (60 - speed) + 0.10 * vehicle_count)
    return label, round(confidence, 3), round(score, 2)
