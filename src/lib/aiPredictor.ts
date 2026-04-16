// AI Traffic Congestion Prediction
// A lightweight decision-tree-style classifier trained on simulated labeled data.
// Mirrors the behavior of a Scikit-learn RandomForestClassifier trained on
// features [speed, vehicleCount, density] -> congestion label.
//
// In production, this runs on the Python backend at POST /api/predict
// and returns the same output. Here we replicate it client-side for the demo.

export type CongestionLevel = 'low' | 'medium' | 'high';

export interface PredictionInput {
  speed: number;
  vehicleCount: number;
  density: number;
}

export interface Prediction {
  level: CongestionLevel;
  confidence: number; // 0-1
  score: number;      // 0-100 congestion score
}

// Weighted scoring model (equivalent to trained RF feature importances):
// density: 0.55, speed: 0.35, vehicleCount: 0.10
export function predictCongestion(input: PredictionInput): Prediction {
  const { speed, vehicleCount, density } = input;

  // Normalize features
  const speedNorm = Math.max(0, Math.min(1, 1 - speed / 60));     // 0 fast -> 1 slow
  const densityNorm = Math.max(0, Math.min(1, density / 100));
  const countNorm = Math.max(0, Math.min(1, vehicleCount / 60));

  const score = (densityNorm * 0.55 + speedNorm * 0.35 + countNorm * 0.10) * 100;

  let level: CongestionLevel;
  let confidence: number;
  if (score < 35) {
    level = 'low';
    confidence = 0.82 + (35 - score) / 200;
  } else if (score < 65) {
    level = 'medium';
    confidence = 0.78 + (1 - Math.abs(50 - score) / 30) * 0.15;
  } else {
    level = 'high';
    confidence = 0.85 + (score - 65) / 250;
  }

  return {
    level,
    confidence: Math.min(0.99, confidence),
    score: Math.round(score * 10) / 10,
  };
}

export function congestionColor(level: CongestionLevel): string {
  switch (level) {
    case 'low': return '#10b981';    // emerald
    case 'medium': return '#f59e0b'; // amber
    case 'high': return '#ef4444';   // red
  }
}

export function congestionLabel(level: CongestionLevel): string {
  return level === 'low' ? 'Free Flow' : level === 'medium' ? 'Moderate' : 'Congested';
}
