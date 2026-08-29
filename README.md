# 📋 Dynamic Survey Platform

> A full-stack web application for creating customizable dynamic surveys, collecting responses with conditional logic, and viewing real-time analytics.

🌐 **Live Application:** [dynamic-survey-platform.vercel.app](https://dynamic-survey-platform.vercel.app/)

💻 **Repository:** [github.com/preeyankakc037/dynamic-survey-platform](https://github.com/preeyankakc037/dynamic-survey-platform)

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Python, FastAPI, Motor (Async MongoDB Driver) |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel (Unified Frontend & Serverless API) |

---

## ✨ Application Features

* **Drag-and-Drop Survey Builder:** Create complex forms instantly using an intuitive visual editor. Supports text, single choice, multiple choice, and rating scale questions.
* **Smart Conditional Logic:** Build dynamic pathways where questions appear or hide based on respondents' previous answers (e.g. Show Question B only if Question A is "Yes").
* **Real-time Analytics Dashboard:** Track completion rates, view visual distribution charts (bar/pie charts), and read individual responses instantly as they come in.
* **Responsive Public UI:** Survey respondents get a smooth, mobile-optimized experience with instant client-side validation using Zod.
* **Modern & Premium Design:** Features a clean, accessible interface with subtle micro-animations and a curated color palette built with Tailwind CSS.

---
## ⚡ Setup Instructions

### Prerequisites

* **Node.js:** v18+
* **Python:** 3.10+
* **Database:** MongoDB Atlas account

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

```

Create `.env` in the `backend/` directory:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/"
DATABASE_NAME="dynamic-survey-platform"

```

Start backend API:

```bash
uvicorn main:app --reload --port 8000

```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev

```

Access the application locally at `http://localhost:5173`.

---

## 🏛️ Architecture Decisions

* **Flexible Schema with MongoDB:** Stored survey structures as dynamic JSON documents to seamlessly accommodate varied question types, validation rules, and logic branching without rigid SQL table migrations.
* **Async Server Core:** Utilized FastAPI alongside `motor` to handle non-blocking asynchronous database read/writes, maximizing request throughput under concurrent usage.
* **Unified Single-Domain Routing:** Routed all API requests through `vercel.json` rewrites (`/api/*`), combining frontend static delivery and backend serverless execution under a single production domain to avoid CORS friction.

---

## ⚖️ Assumptions & Trade-Offs

| Decision | Rationale | Trade-Off |
| --- | --- | --- |
| **Public Survey Access** | Removes signup friction to maximize response conversion rates. | Higher potential for automated spam without anti-bot/rate-limiting protections. |
| **Serverless Deployment** | Operates on a zero-cost infrastructure footprint via Vercel services. | Minor cold-start latency during initial database reconnects after idle periods. |
| **Client-Side Schema Rules** | Delivers instant validation feedback to users filling out forms. | Requires double-validation at the backend endpoint to protect database integrity. |