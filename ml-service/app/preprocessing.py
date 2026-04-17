from io import BytesIO
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

BASE_FEATURES = ["cpuUsage", "memoryUsage", "requestCount"]
OPTIONAL_FEATURES = ["responseTime", "activeInstances"]
ALLOWED_FEATURES = BASE_FEATURES + OPTIONAL_FEATURES


def dataframe_from_csv_bytes(content: bytes) -> pd.DataFrame:
    """Load a CSV file from raw bytes into a pandas DataFrame."""
    if not content:
        raise ValueError("Uploaded file is empty.")

    dataframe = pd.read_csv(BytesIO(content))
    if dataframe.empty:
        raise ValueError("CSV has no rows.")
    return dataframe


def parse_feature_config(feature_config: Optional[str]) -> Optional[List[str]]:
    """Parse comma-separated feature config from form values."""
    if feature_config is None:
        return None

    stripped = feature_config.strip()
    if not stripped:
        return None

    features = [item.strip() for item in stripped.split(",") if item.strip()]
    if not features:
        return None

    invalid = [feature for feature in features if feature not in ALLOWED_FEATURES]
    if invalid:
        raise ValueError(
            "Invalid feature(s) in feature_columns: "
            f"{', '.join(invalid)}. Allowed: {', '.join(ALLOWED_FEATURES)}"
        )
    return features


def select_feature_columns(
    dataframe: pd.DataFrame,
    configured_features: Optional[List[str]] = None,
) -> List[str]:
    """Select training/prediction features from workload columns."""
    if configured_features:
        missing = [column for column in configured_features if column not in dataframe.columns]
        if missing:
            raise ValueError(
                "Configured feature(s) missing from CSV: "
                f"{', '.join(missing)}"
            )
        return configured_features

    missing_required = [column for column in BASE_FEATURES if column not in dataframe.columns]
    if missing_required:
        raise ValueError(
            "CSV must include required workload columns: "
            f"{', '.join(BASE_FEATURES)}"
        )

    selected = [*BASE_FEATURES]
    for optional in OPTIONAL_FEATURES:
        if optional in dataframe.columns:
            selected.append(optional)
    return selected


def extract_feature_matrix(dataframe: pd.DataFrame, feature_columns: List[str]) -> np.ndarray:
    """Validate and extract feature columns as a clean numeric matrix."""
    numeric_dataframe = dataframe[feature_columns].apply(pd.to_numeric, errors="coerce")
    cleaned = numeric_dataframe.dropna(axis=0)
    if len(cleaned) < 10:
        raise ValueError("Not enough valid numeric workload rows. Need at least 10 rows.")
    return cleaned.to_numpy(dtype=np.float32)


def fit_and_scale(values: np.ndarray) -> Tuple[np.ndarray, MinMaxScaler]:
    """Fit a MinMax scaler and return scaled values."""
    scaler = MinMaxScaler(feature_range=(0.0, 1.0))
    scaled_values = scaler.fit_transform(values)
    return scaled_values.astype(np.float32), scaler


def scale_with_existing(values: np.ndarray, scaler: MinMaxScaler) -> np.ndarray:
    """Scale values using a previously fitted scaler."""
    return scaler.transform(values).astype(np.float32)


def inverse_target_scale(
    scaled_targets: np.ndarray,
    scaler: MinMaxScaler,
    target_index: int,
) -> np.ndarray:
    """Inverse-scale target predictions when scaler was fit on all features."""
    reshaped = scaled_targets.reshape(-1, 1)
    filled = np.zeros((reshaped.shape[0], scaler.n_features_in_), dtype=np.float32)
    filled[:, target_index] = reshaped[:, 0]
    inversed = scaler.inverse_transform(filled)
    return inversed[:, target_index]
