# Backend (Phase 1 Skeleton)

This is the **Node.js + Express backend** for the project:

**AI-Based Cloud Cost Optimization with Predictive Auto-Scaling**

This Phase 1 skeleton includes:
- Express app setup
- MongoDB connection with Mongoose
- Modular structure (routes, controllers, services, models, middleware)
- Health endpoint
- Placeholder APIs for datasets, metrics, predictions, scaling, experiments, and dashboard
- Execution layer inside backend (`src/modules/execution`)

---

## 1) Folder Structure

```txt
backend/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── db.js
    │   └── env.js
    ├── controllers/
    │   ├── dashboardController.js
    │   ├── datasetController.js
    │   ├── experimentController.js
    │   ├── healthController.js
    │   ├── metricController.js
    │   ├── predictionController.js
    │   └── scalingController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── models/
    │   ├── Dataset.js
    │   ├── Experiment.js
    │   ├── Metric.js
    │   ├── Prediction.js
    │   └── ScalingAction.js
    ├── modules/
    │   └── execution/
    │       └── executionEngine.js
    ├── routes/
    │   ├── dashboardRoutes.js
    │   ├── datasetRoutes.js
    │   ├── experimentRoutes.js
    │   ├── healthRoutes.js
    │   ├── index.js
    │   ├── metricRoutes.js
    │   ├── predictionRoutes.js
    │   └── scalingRoutes.js
    └── services/
        ├── dashboardService.js
        ├── datasetService.js
        ├── experimentService.js
        ├── metricService.js
        ├── predictionService.js
        └── scalingService.js
```

---

## 2) Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (default URI in `.env.example`)

### Install
```bash
cd backend
npm install
```

### Configure environment
```bash
cp .env.example .env
```

Update `.env` if needed:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cloud_cost_optimization
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Run in development
```bash
npm run dev
```

### Run in production mode
```bash
npm start
```

---

## 3) API Endpoints (Phase 1)

Base URL: `http://localhost:5000/api`

- `GET /health`
- `GET /datasets`
- `POST /datasets`
- `GET /metrics`
- `POST /metrics`
- `GET /predictions`
- `POST /predictions`
- `GET /scaling`
- `POST /scaling/run`
- `GET /experiments`
- `POST /experiments`
- `GET /dashboard`

> Note: Many endpoints are intentionally simple placeholders for future phases.

---

## 4) Next Steps (Phase 2+)

- Add CSV upload handling for dataset ingestion
- Integrate FastAPI ML service for preprocessing/training/prediction/evaluation
- Expand decision engine logic in backend
- Add stronger validation and input schemas
- Add small targeted tests for critical routes
