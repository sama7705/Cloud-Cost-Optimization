from typing import List, Optional

from fastapi import Form
from pydantic import BaseModel, Field


class TrainRequest(BaseModel):
    target_column: str = Field(default="cpuUsage", description="Feature column used as forecasting target")
    feature_columns: Optional[str] = Field(
        default=None,
        description="Optional comma-separated feature list. If omitted, default workload features are used.",
    )
    sequence_length: int = Field(default=24, ge=4, le=512, description="Number of historical points per sequence")
    horizon: int = Field(default=1, ge=1, le=48, description="How many future points to predict during training")
    epochs: int = Field(default=20, ge=1, le=500)
    batch_size: int = Field(default=32, ge=1, le=2048)

    @classmethod
    def as_form(
        cls,
        target_column: str = Form("cpuUsage"),
        feature_columns: Optional[str] = Form(None),
        sequence_length: int = Form(24),
        horizon: int = Form(1),
        epochs: int = Form(20),
        batch_size: int = Form(32),
    ) -> "TrainRequest":
        return cls(
            target_column=target_column,
            feature_columns=feature_columns,
            sequence_length=sequence_length,
            horizon=horizon,
            epochs=epochs,
            batch_size=batch_size,
        )


class PredictRequest(BaseModel):
    target_column: str = Field(default="cpuUsage", description="Feature column used as forecasting target")
    feature_columns: Optional[str] = Field(
        default=None,
        description="Optional comma-separated feature list. Must match training features when provided.",
    )
    sequence_length: int = Field(default=24, ge=4, le=512)
    horizon: int = Field(default=1, ge=1, le=48, description="How many future points to forecast")

    @classmethod
    def as_form(
        cls,
        target_column: str = Form("cpuUsage"),
        feature_columns: Optional[str] = Form(None),
        sequence_length: int = Form(24),
        horizon: int = Form(1),
    ) -> "PredictRequest":
        return cls(
            target_column=target_column,
            feature_columns=feature_columns,
            sequence_length=sequence_length,
            horizon=horizon,
        )


class HealthResponse(BaseModel):
    status: str
    model_available: bool


class TrainResponse(BaseModel):
    message: str
    model_path: str
    scaler_path: str
    train_samples: int
    validation_loss: float


class PredictResponse(BaseModel):
    message: str
    target_column: str
    horizon: int
    predictions: List[float]


class ErrorResponse(BaseModel):
    detail: str
