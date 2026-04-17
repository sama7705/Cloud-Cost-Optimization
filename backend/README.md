# Backend (Phase 1 Skeleton)

This is the **Node.js + Express backend** for:

**AI-Based Cloud Cost Optimization with Predictive Auto-Scaling**

Phase 1 includes:
- Express app setup
- MongoDB connection with Mongoose
- Modular structure (routes, controllers, services, models, middleware)
- Health endpoint
- Placeholder APIs for datasets, metrics, predictions, scaling, experiments, and dashboard
- Basic request validation for write routes
- Centralized error handling middleware

## Folder Structure

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
    │   ├── notFound.js
    │   └── validateRequest.js
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
    ├── services/
    │   ├── dashboardService.js
    │   ├── datasetService.js
    │   ├── experimentService.js
    │   ├── metricService.js
    │   ├── predictionService.js
    │   └── scalingService.js
    └── validation/
        └── schemas.js
```

## Quick Start

### 1) Install dependencies

```bash
cd backend
npm install
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

Default `.env.example` values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cloud_cost_optimization
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3) Run the backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server base URL:

```txt
http://localhost:5000/api
```

## Phase 1 Endpoints

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

> Note: These are intentionally simple placeholders for later phases.
