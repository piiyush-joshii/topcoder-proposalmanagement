# ProposalManager - AI-Powered Proposal Management (Topcoder Edition)

An enterprise-grade End-to-End AI-powered Web Application designed to dramatically speed up the proposal creation process. This version refactors the architecture to meet strict Topcoder challenge specifications, featuring a **NestJS** backend, **Swagger** documentation, and **Server-Synced Timer Logic**.

## 🌟 Key Features

1. **Dashboard & Proposal Tracking:** Create new proposals, resume in-progress drafts, and view generated PDF documents instantly.
2. **NestJS 10+ Backend:** Migrated from standard Express to a scalable, decorator-based NestJS architecture with clear Controller/Service separation.
3. **15-Minute Server-Synced Timer:** Implemented high-precision session tracking. The 15-minute window begins when the "Assess" button is clicked and is strictly enforced by the server.
4. **AI-Driven Clarifying Questions:** Powered by **LangChain** and **Groq LLM** (`llama-3.3-70b-versatile`). The system dynamically analyzes RFP summaries to generate industry-specific clarifying questions.
5. **Swagger Documentation:** Integrated OpenAPI/Swagger UI for real-time API contract testing and verification.
6. **PDF Rendering & Download:** High-fidelity proposal generation with custom A4 document layouts via `html2pdf.js`.

---

## 🎥 Demo Video

Watch the complete end-to-end workflow of the AI Proposal Manager in action below:

<video src="./video.mov" controls="controls" style="max-width: 100%;">
  Your browser does not support the video tag. <a href="./video.mov">Download the video here.</a>
</video>

---

## 🏗 Requirements Complete (Challenge Verification)

This implementation fulfills the "Proposal Management Integration" requirements:

- ✅ **Service Layer Integration:** Replaced mock functions with real API calls using a centralized XHR utility pattern in `src/services/api.js`.
- ✅ **NestJS 10+ Architecture:** Fully implemented with TypeScript, DTOs, and proper Dependency Injection.
- ✅ **Server-Side Timer Synchronization:** Countdown timer is synced with a server-provided `timerStartedAt` timestamp and enforced during the `/answer` phase.
- ✅ **AI Assessment Workflow:** Integrated `POST /proposals/{id}/assess` and `POST /proposals/{id}/answer` endpoints matching the corporate spec.
- ✅ **Swagger API Docs:** Available out-of-the-box for reviewer verification of the API contract.
- ✅ **Industry-Specific Prompting:** Centralized `prompts.ts` logic that adapts based on user-selected industries (Finance, Healthcare, etc.).
- ✅ **Error Handling:** Robust 4xx/5xx handling with user-facing toast notifications. Handling of timer expiration via 408-style error responses.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (Version 18+) installed.

### 2. Environment Variables

Navigate to the project root and ensure your `.env` file exists:

```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
MAX_UPLOAD_FILES=10
MAX_FILE_SIZE_MB=5
```

### 3. Installation & Booting

**Terminal 1: Start the NestJS Backend**
```bash
cd proposal-management/server
npm install
npm run nest:dev

# API running on: http://localhost:3001
# Swagger Docs: http://localhost:3001/api/docs
```

**Terminal 2: Start the React Frontend**
```bash
# In the proposal-management folder
npm install
npm run dev

# UI access at: http://localhost:5173
```

---

## 🛠 Technology Stack

- **Frontend:** React 18, Vite, Lucide-React, CSS Modules (Vanilla), Context API.
- **Backend:** NestJS 10+, TypeScript, RxJS, Swagger/OpenAPI.
- **AI / LLM:** LangChain AI (`@langchain/core`, `@langchain/groq`), Groq Cloud API.
- **LLM Models:** Llama 3.3 70B Versatile (Primary), Mixtral 8x7B (Fallback).
- **Utilities:** Zod (Validation), class-validator (Backend DTOs), html2pdf.js (PDF Rendering).

---

## 🔐 Auth Credentials
- **Username:** `admin`
- **Password:** `topcoder`
