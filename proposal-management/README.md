# ProposalManager - AI-Powered Proposal Management

An end-to-end AI-powered Web Application designed to dramatically speed up the proposal creation process. Built with a React frontend and an Express/Node.js backend, powered by LangChain and the Groq LLM API.

## 🌟 Key Features

1. **Dashboard & Proposal Tracking:** Create new proposals, resume in-progress drafts, and view generated PDF documents instantly.
2. **Context Document Uploads:** Attach RFP context files or reference materials during the proposal workflow.
3. **AI-Driven Clarifying Questions:** Paste your RFP (Request for Proposal) summary. Through the Groq API (powered by models like `llama-3.3-70b-versatile`), the application dynamically reads your summary and returns exactly what it needs to know to write a winning proposal.
4. **Answer Submission:** Fill out the intelligently generated questions to provide perfect context.
5. **AI Proposal Generation:** The server ingests your RFP summary alongside your answers to dynamically generate a cohesive executive summary, problem statement, proposed solution, methodology, and timeline. 
6. **PDF Rendering & Download:** Proposal data is cleanly formatted and displayed on a beautiful web PDF preview. Clicking "Download" generates a high-quality A4 document layout using `html2pdf.js`.

---

## 🎥 Demo Video

Watch the complete end-to-end workflow of the AI Proposal Manager in action below:

<video src="./video.mov" controls="controls" style="max-width: 100%;">
  Your browser does not support the video tag. <a href="./video.mov">Download the video here.</a>
</video>

---

## 🏗 Requirements Complete (Challenge Verification)

Based on the core Topcoder challenge statement, here is the feature verification matrix:

- ✅ **Create proposals:** Users can initiate new workflows, define client names, and manage drafts securely (powered by LocalStorage tracking).
- ✅ **Upload context documents:** Frontend file-upload UI is integrated and tracks file metadata safely during the session.
- ✅ **Submit an RFP summary:** Sent securely to the backend for LLM parsing using robust Langchain Prompts.
- ✅ **Answer AI-generated questions:** The UI cleanly parses the JSON arrays from the Groq API into a dynamic form. Strings, booleans, and long/short texts are all handled gracefully.
- ✅ **View a generated PDF proposal:** The React layer renders the completed AI payload using modern CSS layouts.
- ✅ **PDF display and download implementation:** Implemented successfully on modern browsers, bypassing Blob filename-dropping bugs through injected DOM tags.
- ✅ **API service integration & error handling:** Hardened frontend/backend handshake. If the backend is unreachable or Groq is misconfigured, it safely falls back to offline-capable static mock questions.
- ✅ **Edge case handling and error recovery:** LLM model fallback chaining implemented (`mixtral-8x7b-32768` kicks in if the primary `llama` model is busy).

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (Version 18+) installed.

### 2. Environment Variables

Navigate to the root directory and build your `.env` file (which is safely `.gitignore`'d):

```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

### 3. Installation & Booting

Because this application runs both a **React Frontend (Vite)** and an **Express Backend (Node)**, you will need two terminal windows.

**Terminal 1: Start the Backend Server**
```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Start the Express API
npm run dev
# Server will boot on http://localhost:3001
```

**Terminal 2: Start the Frontend Application**
```bash
# In the root project directory install frontend dependencies
npm install

# Start the React Vite app
npm run dev
# Access the UI at http://localhost:5173
```

### 4. Demo Login

The application is protected by a sleek authentication wall:
- **Username:** `admin`
- **Password:** `topcoder`

---

## 🔮 Future Enhancements

While the application supports an end-to-end flow today, the architecture is designed for scale:

- **Intelligent Prompt Routing (`prompts.js`)**: We have decoupled our Langchain system prompts from the main execution logic into a dedicated `server/prompts.js` file. This architecture now intelligently intercepts the **Industry** selected by the user (e.g., *Healthcare*, *Finance*, *Technology*) and weaves highly specific regulatory guidelines (like HIPAA, PCI-DSS, or SOC2) directly into LLM's system consciousness. This allows the AI to ask exponentially more accurate and dangerous clarifying questions without manual user handholding.
- **RAG Integration (Retrieval-Augmented Generation)**: Future iterations aim to replace the base `documentContext` injection with a fully vectorized Pinecone/ChromaDB layer so the AI can chat over thousands of pages of RFP PDFs.
- **WebSocket Streaming**: Streaming the LLM output token-by-token directly into the UI state instead of waiting for a single block API response.

---

## 🛠 Technology Stack

- **Frontend:** React, React Router, Vite, Lucide-React, CSS (Vanilla + Modules)
- **Backend:** Node.js, Express, CORS
- **AI / LLM Frameworks:** LangChain API (`@langchain/core`, `@langchain/groq`), Groq SDK
- **LLM Models:** Llama 3.3 70B Versatile (Primary), Mixtral 8x7B (Fallback)
- **Utilities:** Zod (Structured JSON Parsing), html2pdf.js (Frontend HTML-to-PDF rendering)
