from typing import Tuple

import numpy as np


def create_sequences(values: np.ndarray, sequence_length: int) -> Tuple[np.ndarray, np.ndarray]:
    """Convert a 1D time series into LSTM-friendly (X, y) windows."""
    if len(values) <= sequence_length:
        raise ValueError(
            f"Need more than {sequence_length} data points to build training sequences."
        )

    features = []
    targets = []

    for start in range(0, len(values) - sequence_length):
        end = start + sequence_length
        features.append(values[start:end])
        targets.append(values[end])

    x = np.array(features, dtype=np.float32)
    y = np.array(targets, dtype=np.float32)
    return x, y
