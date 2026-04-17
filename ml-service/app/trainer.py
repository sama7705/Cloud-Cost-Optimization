from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping

from .model_utils import build_lstm_model, load_artifacts, save_artifacts
from .preprocessing import (
    extract_target_series,
    fit_and_scale,
    inverse_scale,
    scale_with_existing,
)
from .sequences import create_sequences


def train_from_dataframe(
    dataframe: pd.DataFrame,
    target_column: str,
    sequence_length: int,
    epochs: int,
    batch_size: int,
) -> Tuple[int, float, str, str]:
    """Train an LSTM model from a dataframe and persist artifacts."""
    raw_values = extract_target_series(dataframe, target_column)
    scaled_values, scaler = fit_and_scale(raw_values)

    x, y = create_sequences(scaled_values, sequence_length)
    x_train, x_val, y_train, y_val = train_test_split(
        x, y, test_size=0.2, shuffle=False
    )

    model = build_lstm_model(sequence_length)
    callbacks = [EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)]

    history = model.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        verbose=0,
        callbacks=callbacks,
    )

    val_loss = float(history.history["val_loss"][-1])
    metadata = {
        "target_column": target_column,
        "sequence_length": sequence_length,
        "epochs": epochs,
        "batch_size": batch_size,
        "train_samples": int(len(x_train)),
        "validation_samples": int(len(x_val)),
        "validation_loss": val_loss,
    }
    model_path, scaler_path, _ = save_artifacts(model, scaler, metadata)
    return len(x_train), val_loss, str(model_path), str(scaler_path)


def predict_next_points(
    dataframe: pd.DataFrame,
    target_column: str,
    sequence_length: int,
    horizon: int,
) -> List[float]:
    """Generate iterative multi-step forecasts using the saved model."""
    model, scaler, metadata = load_artifacts()

    trained_sequence_length = int(metadata.get("sequence_length", sequence_length))
    if trained_sequence_length != sequence_length:
        raise ValueError(
            f"Provided sequence_length={sequence_length}, but trained model expects "
            f"{trained_sequence_length}."
        )

    raw_values = extract_target_series(dataframe, target_column)
    if len(raw_values) < sequence_length:
        raise ValueError(
            f"Uploaded CSV needs at least {sequence_length} rows in '{target_column}' for prediction."
        )

    scaled_values = scale_with_existing(raw_values, scaler)
    window = scaled_values[-sequence_length:].reshape(1, sequence_length, 1)

    future_scaled = []
    for _ in range(horizon):
        next_scaled = model.predict(window, verbose=0)[0][0]
        future_scaled.append([next_scaled])

        next_step = np.array(next_scaled, dtype=np.float32).reshape(1, 1, 1)
        window = np.concatenate([window[:, 1:, :], next_step], axis=1)

    future_scaled_array = np.array(future_scaled, dtype=np.float32)
    future_values = inverse_scale(future_scaled_array, scaler).reshape(-1)
    return [float(value) for value in future_values]
