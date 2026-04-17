from fastapi import Depends, FastAPI, File, HTTPException, UploadFile

from .model_utils import MODEL_PATH, SCALER_PATH
from .preprocessing import dataframe_from_csv_bytes
from .schemas import (
    HealthResponse,
    PredictRequest,
    PredictResponse,
    TrainRequest,
    TrainResponse,
)
from .trainer import predict_next_points, train_from_dataframe

app = FastAPI(
    title="Cloud Cost Optimization ML Service",
    description="LSTM forecasting service for workload-based cloud auto-scaling decisions.",
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    model_available = MODEL_PATH.exists() and SCALER_PATH.exists()
    return HealthResponse(status="ok", model_available=model_available)


@app.post("/train", response_model=TrainResponse)
async def train_model(
    file: UploadFile = File(..., description="CSV file with historical workload data"),
    request: TrainRequest = Depends(TrainRequest.as_form),
) -> TrainResponse:
    try:
        content = await file.read()
        dataframe = dataframe_from_csv_bytes(content)
        train_samples, validation_loss, model_path, scaler_path = train_from_dataframe(
            dataframe=dataframe,
            target_column=request.target_column,
            sequence_length=request.sequence_length,
            epochs=request.epochs,
            batch_size=request.batch_size,
        )
        return TrainResponse(
            message="Model training completed and artifacts saved.",
            model_path=model_path,
            scaler_path=scaler_path,
            train_samples=train_samples,
            validation_loss=validation_loss,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pylint: disable=broad-exception-caught
        raise HTTPException(status_code=500, detail=f"Training failed: {exc}") from exc


@app.post("/predict", response_model=PredictResponse)
async def predict(
    file: UploadFile = File(..., description="CSV file with recent workload values"),
    request: PredictRequest = Depends(PredictRequest.as_form),
) -> PredictResponse:
    try:
        content = await file.read()
        dataframe = dataframe_from_csv_bytes(content)
        predictions = predict_next_points(
            dataframe=dataframe,
            target_column=request.target_column,
            sequence_length=request.sequence_length,
            horizon=request.horizon,
        )
        return PredictResponse(message="Prediction generated successfully.", predictions=predictions)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pylint: disable=broad-exception-caught
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
