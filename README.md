# CascadeGuard — Cascading Failure Intelligence & Decision Support Platform

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-13%2B-black?style=flat-square&logo=next.js)
![React Flow](https://img.shields.io/badge/React_Flow-11.11-FF007A?style=flat-square)
![Groq AI](https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-f59e0b?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**CascadeGuard** is an AI-assisted cascading failure intelligence platform designed for critical infrastructure defense. It simulates downstream failure propagation across inter-dependent physical and digital assets (Energy, Healthcare, Water, Emergency Services, IT/Telecom, Government), calculates deterministic risk scores (0–100), and generates structured operational responder briefs using Groq LLM.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Incident Control Initiator               │
│      (Incident Type, Description, Starting Node)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  FastAPI Backend Engine                │
│    (GET /health, GET /api/graph, POST /api/incident)   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌────────────────────────────┐ ┌──────────────────────────┐
│  Cascade Simulation Engine │ │   Risk Engine (Formula)  │
│  - NetworkX Directed Graph │ │   - Score (0 - 100)      │
│  - BFS Failure Propagation │ │   - Severity Tier        │
└──────────────┬─────────────┘ └──────────┬───────────────┘
               │                          │
               └────────────┬─────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │    Groq AI Engine      │
               │ (Llama 3.3 70B Model)  │
               └────────────┬───────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Command Center Dashboard               │
│  • Live Status Badges (SYSTEM READY, BASELINE READY)   │
│  • Risk KPI Overview Cards                             │
│  • Prominent React Flow Dependency & Cascade Map       │
│  • AI Operational Brief & Responder Guidance           │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- ⚡ **Deterministic Cascade Engine**: Models inter-sectoral dependencies via NetworkX directed graphs and performs Breadth-First Search (BFS) failure propagation.
- 🎯 **Deterministic Risk Calculation**: Transparent weighted scoring (0–100) combining critical asset weight (50%), impact breadth (30%), and cascade depth (20%).
- 🗺️ **Prominent Visual Map**: Interactive React Flow dependency graph (`h-[550px]`) displaying Incident Origins (Cyan), Level-5 Critical Affected Assets (Rose), and Active Animated Propagation Paths.
- 🤖 **Structured AI Responder Briefs**: High-speed operational briefs synthesized by Groq LLM (`llama-3.3-70b-versatile`) with prioritized emergency action items.
- 🟢 **Functional Live Indicators**: Real-time header badges connected directly to `GET /health` with 10s automatic polling and manual click-to-refresh.

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: Python 3.10+, FastAPI, Uvicorn
- **Graph Modeling**: NetworkX
- **Data Schemas**: Pydantic v2
- **AI Service**: Groq API (`llama-3.3-70b-versatile`)
- **Config**: python-dotenv

### **Frontend**
- **Framework**: Next.js 13+ (App Router), TypeScript
- **Styling & UI**: Tailwind CSS, Shadcn UI
- **Graph Canvas**: React Flow (`reactflow` v11)
- **Icons**: Lucide React

---

## 📁 Repository Structure

```
CascadeGuard-2/
├── backend/
│   ├── main.py                  # FastAPI application entry point & CORS
│   ├── routes/
│   │   ├── cascade.py           # /api/cascade/simulate endpoint
│   │   ├── incidents.py         # /api/incident/analyze main endpoint
│   │   └── graph.py             # /api/graph dependency graph endpoint
│   ├── services/
│   │   ├── cascade_engine.py    # NetworkX BFS failure propagation logic
│   │   ├── risk_engine.py       # Deterministic risk scoring algorithm
│   │   └── llm.py               # Groq LLM responder brief generator
│   ├── models/
│   │   └── schemas.py           # Pydantic data schemas
│   ├── data/
│   │   └── dependencies.json    # Synthetic infrastructure dependency graph
│   ├── requirements.txt         # Backend Python dependencies
│   └── .env.example             # Backend environment template
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main Command Center Dashboard
│   │   └── globals.css          # Global Tailwind & React Flow styles
│   ├── components/
│   │   ├── Header.tsx           # Dynamic top-right status indicator bar
│   │   ├── CascadeMap.tsx       # Prominent React Flow dependency map
│   │   ├── KpiCards.tsx         # Risk & impact summary metric cards
│   │   ├── BriefPanel.tsx       # AI responder brief & guidance panel
│   │   └── Sidebar/
│   │       └── IncidentForm.tsx # Incident control input form
│   ├── lib/
│   │   ├── api.ts               # API fetch utilities (GET /health, GET /api/graph, POST /api/incident/analyze)
│   │   └── types.ts             # TypeScript interface definitions
│   ├── package.json             # Frontend Node.js dependencies
│   └── .env.example             # Frontend environment template
│
├── render.yaml                  # Render deployment configuration blueprint
└── README.md                    # Project documentation
```

---

## 📡 API Reference

### 1. Backend Health Check
```http
GET /health
```
```json
{
  "status": "ok",
  "service": "CascadeGuard Backend"
}
```

### 2. Infrastructure Dependency Graph
```http
GET /api/graph
```
Returns 7 synthetic infrastructure nodes (`sldc`, `hospital`, `water`, `datacenter`, `emergency`, `government`, `ambulance`) and 6 directed dependency edges.

### 3. Incident Analysis & Simulation
```http
POST /api/incident/analyze
Content-Type: application/json

{
  "incident_type": "Power Failure",
  "incident_description": "Power failure at hospital feeder",
  "start_node": "hospital"
}
```

---

## 🚀 Local Setup Instructions

### **1. Prerequisites**
- Python 3.10+
- Node.js 18+
- Groq API Key (Sign up at [console.groq.com](https://console.groq.com))

### **2. Backend Setup**
```bash
cd backend
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set your GROQ_API_KEY

python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local

npm run dev -- -p 3000
```

Open **`http://localhost:3000`** in your browser.

---

## 🌐 Production Deployment

### **Backend Deployment (Render)**
1. Connect your repository to [Render.com](https://render.com).
2. Create a **Web Service** using the root-level [`render.yaml`](render.yaml) blueprint.
3. Configure environment variable `GROQ_API_KEY` in the Render dashboard.

### **Frontend Deployment (Vercel)**
1. Connect your repository to [Vercel.com](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://cascadeguard-backend.onrender.com
   ```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for details.
