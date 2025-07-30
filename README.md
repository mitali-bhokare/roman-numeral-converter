# Roman Numeral Converter 

A full-stack web application that converts integers (1–3999) into Roman numerals.
Includes observability features and a React Spectrum-based UI, all containerized via Docker.

The project consists of:
- A **Node.js + Express** backend REST API
- A **React + Vite + Adobe React Spectrum** frontend
- **Dark/Light Mode**: Adapts to system color scheme
- Built-in **observability**: logging, metrics, and tracing
- **Dockerized**: Fully containerized setup via `docker compose`

### Roman Numeral Specification
This converter adheres to the standard rules of Roman numerals as outlined in [Roman numerals - Wikipedia](https://en.wikipedia.org/wiki/Roman_numerals).

---

## Why This Stack?

| Layer      | Tech                       | Rationale                                                                 |
|------------|----------------------------|--------------------------------------------------------------------------|
| Frontend   | `React`, `Vite`, `React Spectrum` | Fast build time (Vite), accessible UI (Spectrum), simple hooks-based state |
| Testing    | `Vitest`, `React Testing Library` | Lightweight, Jest-compatible DX for unit and integration testing          |
| Backend    | `Node.js`, `Express`       | Minimalistic, easy-to-debug backend API with full control                 |
| Observability | `winston`, `prom-client`, `OpenTelemetry` | Real-world production observability tools                                 |

## Project Structure

```
roman-numeral-converter/
├── roman-numeral-backend/     # Node.js + Express + TypeScript backend
├── roman-numeral-ui/          # Vite + React + TypeScript frontend
└── README.md
```

---

## Features

- Converts numbers (1–3999) into Roman numerals
- REST API (`/romannumeral?query=123`)
- React UI with Spectrum design system
- Unit tests with Vitest + Testing Library
- Observability:
  - Logging via `winston`
  - Metrics exposed via `/metrics` using `prom-client`
  - Distributed tracing using OpenTelemetry + Jaeger

---

## Tech Stack & Dependencies

### Backend (`roman-numeral-backend`)
- **Node.js + Express** – Minimal REST API
- **TypeScript** – Type safety
- **Winston** – Logging with timestamps and levels
- **prom-client** – Metrics in Prometheus format
- **OpenTelemetry (basic)** – Adds tracing support

### Frontend (`roman-numeral-ui`)
- **React + Vite** – Fast dev/build tooling
- **TypeScript**
- **@adobe/react-spectrum** – Accessible UI components
- **Vitest + Testing Library** – Modern unit testing setup
- **OpenTelemetry Web SDK** – Frontend tracing + Fetch instrumentation
---


## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Docker + Docker Compose (for Jaeger setup)

## Docker Deployment + Observability

To run the full stack with observability + Jaeger UI:

### 1. Clone the repo

```bash
git clone https://github.com/mitali-bhokare/roman-numeral-converter.git
cd roman-numeral-converter
```

### 2. Build and start all services:
> Note for reviewer: Please ensure Docker and Docker Compose are installed.
You can launch the full solution and observability stack by running:

```bash
docker compose up --build -d
```

> '-d' flag is used to run docker in detached mode

### 2. Services will be available at:

| Service            | URL                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Frontend UI        | [http://localhost:5173](http://localhost:5173)                                               |
| Backend API        | [http://localhost:8080/romannumeral?query=123](http://localhost:8080/romannumeral?query=123) |
| Prometheus Metrics | [http://localhost:8080/metrics](http://localhost:8080/metrics)                               |
| Jaeger UI          | [http://localhost:16686](http://localhost:16686)                                             |


The frontend proxy is configured to forward /v1/traces to the Jaeger OTLP HTTP receiver (localhost:4318).

> Note: If Jaeger spans don't show immediately, give it a few seconds — spans are batched before submission.

### 3. To stop all services:
```bash
docker compose down
```

## Running Tests
This project includes unit tests using [Vitest](https://vitest.dev/). 
### Backend
```bash
cd roman-numeral-backend
npm run test
```

### Frontend
```bash
cd roman-numeral-ui
npm run test
```

---

## API Endpoint

```
GET /romannumeral?query=123
→ { "output": "CXXIII" }
```

Returns a Roman numeral string or an error message for invalid input.

---

## Observability Details

- **Logs**: Winston logger in `roman-numeral-backend/src/logger.ts` Logs are timestamped and persisted on disk in the `logs/` directory inside the backend Docker container. This allows for local debugging and inspection even without a cloud logging solution.
  - Log Output (inside container):
      - `logs/error.log` – Contains only error-level logs for debugging failures.
      - `logs/combined.log` – Contains all logs (info, warn, error) for general request tracing and observability.
  - To inspect logs while the container is running:
    ```bash
    docker exec -it roman-numeral-converter-backend-1 cat logs/combined.log
    ```
- **Metrics**: Prometheus-formatted metrics exposed at `/metrics`
- **Tracing**: Request-level tracing ID added for basic observability
  - Backend: Uses OpenTelemetry Node SDK
  - Frontend: Uses OpenTelemetry Web SDK + Fetch instrumentation
  - Exported using OTLP HTTP to Jaeger (port 4318)
  - View traces at: http://localhost:16686

  ## System Architecture
                        ┌────────────────────┐
                        │  User's Browser    │
                        │ (React + Spectrum) │
                        └────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  Frontend (Vite App) │
                      │ - Roman UI           │
                      │ - Sends HTTP GET     │
                      │   /romannumeral?     │
                      │ - Sends OTLP traces  │
                      └────────┬─────────────┘
                               │
                               ▼
                 ┌─────────────────────────────┐
                 │ Backend (Node.js + Express) │
                 │ - /romannumeral API         │
                 │ - Converts 1–3999 to Roman  │
                 │ - Logs via Winston          │
                 │ - Metrics via prom-client   │
                 │ - Traces via OpenTelemetry  │
                 └────────┬──────────────┬─────┘
                          │              │
                          ▼              ▼
         ┌────────────────────────┐   ┌──────────────────────┐
         │    Jaeger Collector    │   │   Prometheus         │
         │  (OTLP HTTP @ 4318)    │   │ (Scrapes /metrics)   │
         └────────────┬───────────┘   └──────────────────────┘
                      │                          
                      ▼                          
             ┌─────────────────────────┐        
             │ Jaeger UI               │         
             │ http://localhost:16686  │    
             │                         │         
             └─────────────────────────┘         


## Diagram Highlights
- Frontend (Vite + React + Adobe Spectrum):
  - Renders form UI.
  - Sends requests to backend `/romannumeral?query=123`
  - Sends OTLP tracing spans (via @opentelemetry/sdk-trace-web).

- Backend (Node.js + Express + TypeScript):
  - Handles the Roman conversion logic.
  - Exposes `/metrics` endpoint.
  - Sends traces using OpenTelemetry to Jaeger via OTLP.

- Observability Stack:
  - Jaeger: visualizes distributed traces.
  - Prometheus: scrapes backend metrics via endpoint `http://localhost:8080/metrics`
  
## Credits
  Built for the Adobe GenStudio Performance Marketing Engineering Take-Home Assessment.
