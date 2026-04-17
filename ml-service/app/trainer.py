from typing import List, Tuple

import numpy as np
import pandas as pd
from tensorflow.keras.callbacks import EarlyStopping

from .model_utils import build_lstm_model, load_artifacts, save_artifacts
from .preprocessing import (
    extract_feature_matrix,
    fit_and_scale,
    inverse_target_scale,
    parse_feature_config,
    scale_with_existing,
    select_feature_columns,
)
from .sequences import create_sequences


def _split_train_validation(x: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    split_idx = max(int(len(x) * 0.8), 1)
    if split_idx >= len(x):
        split_idx = len(x) - 1
    if split_idx < 1:
        raise ValueError("Not enough sequence windows to create train/validation splits.")
    return x[:split_idx], x[split_idx:], y[:split_idx], y[split_idx:]


def train_from_dataframe(
    dataframe: pd.DataFrame,
    target_column: str,
    feature_config: str,
    sequence_length: int,
    horizon: int,
    epochs: int,
    batch_size: int,
) -> Tuple[int, float, str, str]:
    """Train an LSTM model from real workload dataframe rows and persist artifacts."""
    configured_features = parse_feature_config(feature_config)
    feature_columns = select_feature_columns(dataframe, configured_features)

    if target_column not in feature_columns:
        raise ValueError(
            f"target_column '{target_column}' must be included in selected features: {feature_columns}."
        )

    raw_features = extract_feature_matrix(dataframe, feature_columns)
    scaled_features, scaler = fit_and_scale(raw_features)
    target_index = feature_columns.index(target_column)

    x, y = create_sequences(
        values=scaled_features,
        sequence_length=sequence_length,
        target_index=target_index,
        horizon=horizon,
    )
    x_train, x_val, y_train, y_val = _split_train_validation(x, y)

    model = build_lstm_model(sequence_length, n_features=len(feature_columns), forecast_horizon=horizon)
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
        "feature_columns": feature_columns,
        "target_index": target_index,
        "sequence_length": sequence_length,
        "forecast_horizon": horizon,
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
    feature_config: str,
    sequence_length: int,
    horizon: int,
) -> List[float]:
    """Generate workload forecasts using the saved model and real workload rows."""
    model, scaler, metadata = load_artifacts()

    trained_sequence_length = int(metadata.get("sequence_length"))
    trained_horizon = int(metadata.get("forecast_horizon", 1))
    trained_target_column = str(metadata.get("target_column"))
    trained_feature_columns = list(metadata.get("feature_columns", []))
    target_index = int(metadata.get("target_index"))

    if trained_sequence_length != sequence_length:
        raise ValueError(
            f"Provided sequence_length={sequence_length}, but trained model expects "
            f"{trained_sequence_length}."
        )

    if target_column != trained_target_column:
        raise ValueError(
            f"Provided target_column='{target_column}', but trained model expects "
            f"'{trained_target_column}'."
        )

    configured_features = parse_feature_config(feature_config)
    feature_columns = select_feature_columns(dataframe, configured_features)
    if feature_columns != trained_feature_columns:
        raise ValueError(
            "Provided features do not match the trained model. "
            f"Expected {trained_feature_columns}, received {feature_columns}."
        )

    if horizon > trained_horizon:
        raise ValueError(
            f"Requested horizon={horizon}, but trained model supports up to {trained_horizon}."
        )

    raw_features = extract_feature_matrix(dataframe, feature_columns)
    if len(raw_features) < sequence_length:
        raise ValueError(
            f"Uploaded CSV needs at least {sequence_length} rows for prediction."
        )

    scaled_features = scale_with_existing(raw_features, scaler)
    window = scaled_features[-sequence_length:, :].reshape(1, sequence_length, len(feature_columns))

    predicted_scaled = model.predict(window, verbose=0)[0][:horizon]
    predicted_values = inverse_target_scale(predicted_scaled, scaler, target_index=target_index)
    return [float(value) for value in predicted_values]
