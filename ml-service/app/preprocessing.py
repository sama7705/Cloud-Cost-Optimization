from io import BytesIO
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


def dataframe_from_csv_bytes(content: bytes) -> pd.DataFrame:
    """Load a CSV file from raw bytes into a pandas DataFrame."""
    if not content:
        raise ValueError("Uploaded file is empty.")

    dataframe = pd.read_csv(BytesIO(content))
    if dataframe.empty:
        raise ValueError("CSV has no rows.")
    return dataframe


def extract_target_series(dataframe: pd.DataFrame, target_column: str) -> np.ndarray:
    """Validate and extract the target column as a clean numeric array."""
    if target_column not in dataframe.columns:
        raise ValueError(f"Column '{target_column}' was not found in the uploaded CSV.")

    series = pd.to_numeric(dataframe[target_column], errors="coerce").dropna()
    if len(series) < 10:
        raise ValueError("Not enough numeric data points to train or predict. Need at least 10 rows.")

    return series.to_numpy(dtype=np.float32).reshape(-1, 1)


def fit_and_scale(values: np.ndarray) -> Tuple[np.ndarray, MinMaxScaler]:
    """Fit a MinMax scaler and return scaled values."""
    scaler = MinMaxScaler(feature_range=(0.0, 1.0))
    scaled_values = scaler.fit_transform(values)
    return scaled_values.astype(np.float32), scaler


def scale_with_existing(values: np.ndarray, scaler: MinMaxScaler) -> np.ndarray:
    """Scale values using a previously fitted scaler."""
    return scaler.transform(values).astype(np.float32)


def inverse_scale(values: np.ndarray, scaler: MinMaxScaler) -> np.ndarray:
    """Return values back to the original scale."""
    return scaler.inverse_transform(values)
