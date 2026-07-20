# GridDNA AI

**Autonomous Energy Intelligence Platform** — *The AI Brain for Energy Infrastructure*

Enterprise-grade IoT + AI platform for electrical infrastructure monitoring, predictive maintenance, and energy optimization.

## Monorepo Structure

```
GridDNA-AI/
├── backend/          NestJS API (auth, assets, telemetry, MQTT ingest)
├── ai/               FastAPI ML services (anomaly, predictions, copilot)
├── web/              React + TypeScript dashboard
├── mobile/           React Native technician app (Week 5)
├── edge/             ESP32 firmware (GridDNA Node G1)
├── infra/            Database init, K8s manifests (future)
└── docs/             OpenAPI specification
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop
- PlatformIO (for edge firmware)

## Quick Start

### 1. Infrastructure

```bash
cp .env.example .env
npm install
npm run infra:up
```

Services:
| Service    | URL                          |
|------------|------------------------------|
| PostgreSQL | localhost:5432               |
| Redis      | localhost:6379               |
| EMQX MQTT  | localhost:1883               |
| EMQX Dashboard | http://localhost:18083 (admin / griddna_admin) |

### 2. Backend API

```bash
cd backend
npm install
npm run start:dev
```

API: http://localhost:3000/api/v1  
Swagger: http://localhost:3000/api/docs

Default admin: `admin@griddna.ai` / `GridDNA2026!`

### 3. AI Service

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

AI API: http://localhost:8000/docs

### 4. Web Dashboard

```bash
cd web
npm install
npm run dev
```

Dashboard: http://localhost:5173

### 5. Edge Firmware

```bash
cd edge/firmware/griddna-node-g1
pio run -t upload
```

Configure WiFi and MQTT in `src/config.h`.

## Development Roadmap

- **Week 1** ✓ Monorepo, Docker, NestJS skeleton, DB schema, dashboard shell
- **Week 2** IoT pipeline (MQTT → TimescaleDB → WebSocket)
- **Week 3** Anomaly detection + SHAP explanations
- **Week 4** Predictive maintenance + AI insights UI
- **Week 5** Mobile app + Energy Copilot
- **Week 6** PCB, tests, PFE documentation

## License

Proprietary — GridDNA AI © 2026
