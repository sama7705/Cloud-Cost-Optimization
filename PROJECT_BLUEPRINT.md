# AI-Based Cloud Cost Optimization with Predictive Auto-Scaling

## 1) Recommended Folder Structure

```text
Cloud-Cost-Optimization/
├─ frontend/                              # React + Vite + Recharts dashboard
│  ├─ public/
│  ├─ src/
│  │  ├─ api/                             # Axios clients for backend and ML service
│  │  │  ├─ backendClient.js
│  │  │  ├─ mlClient.js
│  │  │  └─ endpoints.js
│  │  ├─ components/
│  │  │  ├─ layout/                       # Navbar, sidebar, page shells
│  │  │  ├─ charts/                       # Recharts reusable charts
│  │  │  ├─ tables/
│  │  │  └─ cards/
│  │  ├─ pages/
│  │  │  ├─ Home.jsx
│  │  │  ├─ DataUpload.jsx
│  │  │  ├─ DataPreprocessing.jsx
│  │  │  ├─ Predictions.jsx
│  │  │  ├─ AutoScaling.jsx
│  │  │  ├─ Monitoring.jsx
│  │  │  └─ Experiments.jsx
│  │  ├─ hooks/                           # polling, websocket/subscription hooks
│  │  ├─ state/                           # Zustand/Redux context slices
│  │  ├─ utils/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ package.json
│  └─ vite.config.js
│
├─ backend/                               # Node.js + Express orchestration layer
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ modules/
│  │  │  ├─ ingestion/                    # CSV parsing + schema validation
│  │  │  ├─ preprocessing/                # data cleanup & feature building
│  │  │  ├─ decision-engine/              # scaling policy logic
│  │  │  └─ execution/                    # local scaling simulation engine
│  │  ├─ models/                          # MongoDB/Mongoose models
│  │  ├─ middleware/
│  │  └─ server.js
│  ├─ uploads/                            # raw CSV upload staging
│  ├─ package.json
│  └─ README.md
│
├─ ml-service/                            # Python FastAPI + LSTM pipeline
│  ├─ app/
│  │  ├─ api/
│  │  │  └─ routes.py
│  │  ├─ core/                            # settings, logging
│  │  ├─ data/                            # loaders, scalers, train/val split
│  │  ├─ models/                          # LSTM model definition
│  │  ├─ training/                        # train/evaluate scripts
│  │  ├─ inference/                       # forecast pipeline
│  │  └─ schemas/                         # Pydantic request/response
│  ├─ artifacts/                          # model checkpoints + scalers
│  ├─ requirements.txt
│  └─ main.py
│
├─ data/                                  # historical workload CSV files
│  ├─ raw/
│  ├─ processed/
│  └─ samples/
│
├─ docs/
│  ├─ architecture.md
│  ├─ api-contract.md
│  ├─ experiment-design.md
│  └─ metrics-definition.md
│
├─ scripts/
│  ├─ seed_db.js
│  ├─ run_experiment.sh
│  └─ evaluate_results.py
│
├─ docker-compose.yml                     # mongodb + backend + ml-service + frontend
└─ README.md
```

---

## 2) High-Level Architecture

1. **Frontend (React + Vite + Recharts)**
   - Allows CSV upload, preprocessing configuration, model training/inference trigger, scaling-policy tuning, and experiment comparison dashboards.
2. **Backend (Node.js + Express)**
   - Central orchestrator.
   - Stores metadata/results in MongoDB.
   - Calls ML service for model training and forecasting.
   - Runs decision engine and simulation execution layer.
3. **ML Service (FastAPI + LSTM)**
   - Handles all model-centric tasks (train/evaluate/predict).
   - Returns time-series forecasts and confidence information.
4. **MongoDB (local)**
   - Persists datasets, preprocessing runs, predictions, scaling actions, and experiment metrics.
5. **Execution Layer (local simulator)**
   - Simulates VM/container scale up/down actions based on policy outputs.
   - Computes cost/performance outcomes without calling real cloud providers.

**Logical flow**
- Upload historical CSV → preprocess → train LSTM → forecast workload → run decision policy → simulate scaling actions → calculate metrics → visualize and compare experiments.

---

## 3) Backend Modules (Node + Express)

1. **Dataset/Ingestion Module**
   - CSV upload endpoints.
   - Schema checks (timestamp, workload demand, optional response time, capacity).
   - Dataset versioning and storage paths.

2. **Preprocessing Module**
   - Missing value handling.
   - Time alignment/resampling (e.g., 1-min/5-min intervals).
   - Feature engineering (lags, rolling mean, rolling std, time-of-day/day-of-week).
   - Train/validation/test split metadata.

3. **Prediction Orchestration Module**
   - Sends train/infer jobs to FastAPI ML service.
   - Stores model version and prediction outputs.

4. **Decision Engine Module**
   - Converts predicted workload to required capacity.
   - Applies scaling policy constraints:
     - min/max instances
     - cooldown
     - step size
     - safety margin
   - Produces candidate scaling actions.

5. **Execution Simulation Module**
   - Applies action timeline to a local resource-state model.
   - Simulates response-time and utilization behavior.
   - Estimates cost per interval (instance-hour model).

6. **Metrics & Experiment Module**
   - Computes and stores:
     - cost reduction
     - average/p95 response time
     - resource utilization
     - SLA violation rate
   - Supports baseline vs predictive-policy comparison.

7. **Monitoring API Module**
   - Aggregated endpoints for dashboard cards/charts/tables.
   - Run status and health checks.

---

## 4) Frontend Pages

1. **Home / System Overview**
   - Current system status, latest run summary, quick links.

2. **Data Collection / Upload**
   - Upload CSV, preview sample rows, validate columns, view dataset catalog.

3. **Data Preprocessing**
   - Configure cleaning options, interval resampling, and generated features.
   - Show preprocessing logs and output summary.

4. **Predictions (LSTM)**
   - Train model, choose hyperparameters (sequence length, epochs, hidden units).
   - Plot actual vs predicted workload.

5. **Auto-Scaling Decision Simulator**
   - Configure policy parameters.
   - Visualize recommended scale actions over forecast horizon.

6. **Monitoring Dashboard**
   - Live-like simulation timeline.
   - Recharts for cost, response time, utilization, SLA breaches.

7. **Experiments Comparison**
   - Compare baseline rule-based policy vs predictive policy.
   - Table + charts for key metrics and statistical summary.

---

## 5) ML Service Responsibilities (FastAPI)

1. **Dataset intake for modeling**
   - Accept processed time-series from backend (or dataset reference).

2. **LSTM training**
   - Build supervised sequences.
   - Train and validate LSTM.
   - Save artifacts (model weights, scaler, config, metrics).

3. **Inference / forecasting**
   - Provide future workload predictions for configurable horizon.
   - Return point forecasts and optional uncertainty bands.

4. **Model registry metadata**
   - Model version, training date, dataset version, performance metrics (MAE/RMSE/MAPE).

5. **Evaluation endpoints**
   - Evaluate model against holdout data.
   - Return error metrics and diagnostic data.

6. **Health and readiness**
   - `/health`, model availability, artifact checks.

---

## 6) API List Between Services

### Frontend ↔ Backend (Express)

- `POST /api/datasets/upload`
  - Upload workload CSV.
- `GET /api/datasets`
  - List datasets.
- `POST /api/preprocessing/run`
  - Run preprocessing for selected dataset.
- `GET /api/preprocessing/:runId`
  - Preprocessing status/result.
- `POST /api/predictions/train`
  - Trigger ML model training via backend.
- `POST /api/predictions/forecast`
  - Request forecast for horizon `H`.
- `POST /api/scaling/simulate`
  - Run decision + execution simulation.
- `GET /api/metrics/:experimentId`
  - Retrieve computed metrics.
- `GET /api/dashboard/summary`
  - Aggregated KPI cards.
- `GET /api/dashboard/timeseries`
  - Charts data for workload/cost/utilization/response time.
- `POST /api/experiments/compare`
  - Compare two or more experiment runs.

### Backend (Express) ↔ ML Service (FastAPI)

- `POST /ml/train`
  - Body: processed series + config.
  - Returns model ID + train metrics.
- `POST /ml/forecast`
  - Body: model ID + recent sequence + horizon.
  - Returns forecast array.
- `POST /ml/evaluate`
  - Body: model ID + test set.
  - Returns MAE/RMSE/MAPE.
- `GET /ml/models/:modelId`
  - Model metadata.
- `GET /health`
  - Service health check.

---

## 7) Development Order in Phases

### Phase 1 — Foundation & Data Pipeline
- Initialize monorepo structure (frontend/backend/ml-service).
- Set up MongoDB local and shared `.env` conventions.
- Implement CSV upload, validation, and dataset catalog.
- Deliverable: ingest and persist real historical datasets.

### Phase 2 — Preprocessing + Baseline Simulator
- Build preprocessing module and processed dataset storage.
- Implement a simple baseline scaling policy (threshold/rule-based).
- Implement local execution simulation and basic metrics.
- Deliverable: end-to-end baseline experiment without ML.

### Phase 3 — LSTM ML Service Integration
- Build FastAPI training/inference endpoints.
- Train LSTM on processed datasets.
- Integrate backend orchestration for model lifecycle.
- Deliverable: forecast workload from historical CSV-based data.

### Phase 4 — Predictive Decision Engine
- Convert forecasts into proactive scaling actions.
- Add policy knobs (cooldown, min/max, safety factor).
- Compute full KPI set for predictive policy.
- Deliverable: predictive auto-scaling simulation.

### Phase 5 — Dashboard & Experiment Comparison
- Build all frontend pages with Recharts.
- Add experiment comparison views and downloadable reports.
- Deliverable: academic-demo-ready UI with comparative evidence.

### Phase 6 — Validation, Documentation, and Thesis Results
- Run multiple datasets/periods.
- Perform ablation and sensitivity experiments.
- Document architecture, API contract, and reproducibility steps.
- Deliverable: final project report + reproducible PoC.

---

## Suggested First Milestone (practical)

If you want to start immediately:
1. Finalize CSV schema and choose two public historical workload datasets.
2. Implement upload + preprocessing pipeline.
3. Add baseline simulator and metrics first.
4. Then plug in LSTM forecasting.

This sequence minimizes integration risk and gives you measurable results early.
