from typing import Tuple

import numpy as np


def create_sequences(
    values: np.ndarray,
    sequence_length: int,
    target_index: int,
    horizon: int,
) -> Tuple[np.ndarray, np.ndarray]:
    """Convert multivariate time series into sequence windows and targets."""
    if len(values) <= sequence_length + horizon - 1:
        raise ValueError(
            "Not enough rows to build windows for the requested sequence_length and horizon. "
            f"Need more than {sequence_length + horizon - 1} rows."
        )

    features = []
    targets = []

    max_start = len(values) - sequence_length - horizon + 1
    for start in range(0, max_start):
        end = start + sequence_length
        target_end = end + horizon
        features.append(values[start:end, :])
        targets.append(values[end:target_end, target_index])

    x = np.array(features, dtype=np.float32)
    y = np.array(targets, dtype=np.float32)
    return x, y
