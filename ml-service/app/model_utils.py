import json
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from tensorflow.keras.models import load_model


MODEL_DIR = Path("models")
MODEL_PATH = MODEL_DIR / "lstm_model.keras"
SCALER_PATH = MODEL_DIR / "scaler.joblib"
META_PATH = MODEL_DIR / "metadata.json"


def ensure_model_dir() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)


def build_lstm_model(sequence_length: int, n_features: int, forecast_horizon: int) -> Sequential:
    """Create and compile an LSTM model for multivariate forecasting."""
    model = Sequential(
        [
            Input(shape=(sequence_length, n_features)),
            LSTM(64, return_sequences=True),
            Dropout(0.2),
            LSTM(32),
            Dense(16, activation="relu"),
            Dense(forecast_horizon),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    return model


def save_artifacts(
    model: Sequential,
    scaler: MinMaxScaler,
    metadata: Dict[str, Any],
) -> Tuple[Path, Path, Path]:
    """Persist trained model, scaler, and metadata."""
    ensure_model_dir()
    model.save(MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    META_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return MODEL_PATH, SCALER_PATH, META_PATH


def load_artifacts() -> Tuple[Sequential, MinMaxScaler, Dict[str, Any]]:
    """Load model artifacts from disk."""
    if not MODEL_PATH.exists() or not SCALER_PATH.exists() or not META_PATH.exists():
        raise FileNotFoundError(
            "Model artifacts are missing. Train the model first using POST /train."
        )

    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    metadata = json.loads(META_PATH.read_text(encoding="utf-8"))
    return model, scaler, metadata
