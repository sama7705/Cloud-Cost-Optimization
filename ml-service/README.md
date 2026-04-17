# ML Service (FastAPI + TensorFlow LSTM)

This service forecasts future workload values from uploaded historical workload CSV files.
It is designed for **AI-Based Cloud Cost Optimization with Predictive Auto-Scaling**.

## Folder Structure

```text
ml-service/
├── app/
│   ├── main.py              # FastAPI app and endpoints
│   ├── model_utils.py       # LSTM model creation + save/load utilities
│   ├── preprocessing.py     # CSV parsing and scaling utilities
│   ├── schemas.py           # Pydantic request/response models
│   ├── sequences.py         # Sliding-window sequence generation
│   └── trainer.py           # Training and prediction orchestration
├── data/                    # Optional local datasets
├── models/                  # Saved model/scaler artifacts
├── requirements.txt
└── train.py                 # CLI training entrypoint
```

## 1) Setup

```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## 2) Run the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at:
- `http://localhost:8000/docs`

## 3) CSV Input Format

Your CSV should contain at least one numeric target column, by default: `workload`.

Example:

```csv
timestamp,workload
2026-01-01 00:00:00,41
2026-01-01 01:00:00,43
2026-01-01 02:00:00,39
...
```

## 4) Endpoints

### GET `/health`
Checks service status and whether trained model files are present.

### POST `/train`
Uploads historical CSV and trains the model.

**Form-data fields:**
- `file` (required): CSV file
- `target_column` (optional, default `workload`)
- `sequence_length` (optional, default `24`)
- `epochs` (optional, default `20`)
- `batch_size` (optional, default `32`)

Example:

```bash
curl -X POST "http://localhost:8000/train" \
  -F "file=@data/historical_workload.csv" \
  -F "target_column=workload" \
  -F "sequence_length=24" \
  -F "epochs=20" \
  -F "batch_size=32"
```

### POST `/predict`
Uploads recent CSV values and predicts future workload points.

**Form-data fields:**
- `file` (required): CSV file with recent values
- `target_column` (optional, default `workload`)
- `sequence_length` (optional, default `24`, must match trained model)
- `horizon` (optional, default `6`)

Example:

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@data/recent_workload.csv" \
  -F "target_column=workload" \
  -F "sequence_length=24" \
  -F "horizon=6"
```

## 5) Train from CLI (Optional)

```bash
python train.py \
  --data data/historical_workload.csv \
  --target-column workload \
  --sequence-length 24 \
  --epochs 20 \
  --batch-size 32
```

## Notes

- Model artifacts are saved to `ml-service/models/`:
  - `lstm_model.keras`
  - `scaler.joblib`
  - `metadata.json`
- Prediction uses iterative multi-step forecasting (predict one step, feed it back, repeat).
