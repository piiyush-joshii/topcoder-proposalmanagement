/**
 * API Service — Proposal Management
 * Uses LangChain + Groq backend for AI features, with mock fallback.
 */

const API_BASE = 'http://localhost:3001';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Persist proposals for hot-reloads
function getStoredProposals() {
  try {
    const data = localStorage.getItem('proposalManager_proposals');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveProposals(proposals) {
  try {
    localStorage.setItem('proposalManager_proposals', JSON.stringify(proposals));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

let proposals = getStoredProposals();
let idCounter = proposals.length > 0 ? Math.max(...proposals.map((p) => parseInt(p.id) || 0)) + 1 : 1;

let _backendAvailable = null;

async function isBackendAvailable() {
  // Only cache if it historically succeeded. If false, we should keep trying just in case it booted up.
  if (_backendAvailable === true) return true;
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    _backendAvailable = data.status === 'ok' && data.groqConfigured;
    if (!_backendAvailable) {
      console.warn('⚠️ Backend running but Groq not configured — using mock questions');
    }
    return _backendAvailable;
  } catch {
    console.warn('⚠️ Backend not reachable — using mock questions');
    _backendAvailable = false;
    return false;
  }
}

// Allow rechecking (e.g., if user starts server later)
export function resetBackendCheck() {
  _backendAvailable = null;
}

// ─── PROPOSALS (client-side store) ───────────────────────────────────────────

export async function createProposal(data) {
  await delay(600);
  const proposal = {
    id: String(idCounter++),
    title: data.title,
    clientName: data.clientName,
    industry: data.industry,
    deadline: data.deadline,
    rfpSummary: data.rfpSummary || '',
    documents: [],
    questions: [],
    answers: {},
    status: 'draft',
    pdfUrl: null,
    generatedProposal: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  proposals.push(proposal);
  saveProposals(proposals);
  return { success: true, data: proposal };
}

export async function getProposals() {
  await delay(200);
  return { success: true, data: [...proposals].reverse() };
}

export async function getProposalById(id) {
  await delay(150);
  const proposal = proposals.find((p) => p.id === id);
  if (!proposal) return { success: false, error: 'Proposal not found' };
  return { success: true, data: { ...proposal } };
}

export async function updateProposal(id, updates) {
  await delay(300);
  const idx = proposals.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: 'Proposal not found' };
  proposals[idx] = { ...proposals[idx], ...updates, updatedAt: new Date().toISOString() };
  saveProposals(proposals);
  return { success: true, data: { ...proposals[idx] } };
}

export async function deleteProposal(id) {
  await delay(200);
  proposals = proposals.filter((p) => p.id !== id);
  saveProposals(proposals);
  return { success: true };
}

// ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

export function uploadDocument(proposalId, file, onProgress) {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        const doc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        const idx = proposals.findIndex((p) => p.id === proposalId);
        if (idx !== -1) {
          proposals[idx].documents.push(doc);
          saveProposals(proposals);
        }
        onProgress?.(100);
        setTimeout(() => resolve({ success: true, data: doc }), 200);
      } else {
        onProgress?.(Math.round(progress));
      }
    }, 200);
  });
}

// ─── RFP SUMMARY ────────────────────────────────────────────────────────────

export async function submitRfpSummary(proposalId, summary) {
  await delay(500);
  const idx = proposals.findIndex((p) => p.id === proposalId);
  if (idx === -1) return { success: false, error: 'Proposal not found' };
  proposals[idx].rfpSummary = summary;
  proposals[idx].status = 'rfp_submitted';
  proposals[idx].updatedAt = new Date().toISOString();
  saveProposals(proposals);
  return { success: true, data: { ...proposals[idx] } };
}

// ─── AI QUESTIONS (Groq-powered with fallback) ──────────────────────────────

const fallbackQuestions = [
  { id: 'q1', text: 'What is the primary business problem the client is trying to solve?', type: 'long_text', required: true, category: 'Problem Statement' },
  { id: 'q2', text: 'What is the expected timeline for the project delivery?', type: 'short_text', required: true, category: 'Timeline' },
  { id: 'q3', text: 'What is the estimated budget range for this project?', type: 'select', required: true, category: 'Budget', options: ['Under $50K', '$50K – $100K', '$100K – $250K', '$250K – $500K', 'Over $500K'] },
  { id: 'q4', text: 'What are the key technical requirements or constraints?', type: 'long_text', required: true, category: 'Technical' },
  { id: 'q5', text: 'Who are the primary stakeholders and decision-makers?', type: 'long_text', required: false, category: 'Stakeholders' },
  { id: 'q6', text: 'Are there any compliance or regulatory requirements to consider?', type: 'short_text', required: false, category: 'Compliance' },
  { id: 'q7', text: 'What differentiators should be highlighted in the proposal?', type: 'long_text', required: true, category: 'Strategy' },
];

export async function generateQuestions(proposalId) {
  const idx = proposals.findIndex((p) => p.id === proposalId);
  if (idx === -1) return { success: false, error: 'Proposal not found' };

  const proposal = proposals[idx];
  const backendUp = await isBackendAvailable();

  let questions;

  if (backendUp) {
    // 🧠 Use LangChain + Groq for dynamic questions
    try {
      console.log('🧠 Calling Groq for dynamic question generation...');
      const res = await fetch(`${API_BASE}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfpSummary: proposal.rfpSummary,
          title: proposal.title,
          clientName: proposal.clientName,
          industry: proposal.industry,
          documents: proposal.documents,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        questions = data.data;
        console.log(`✅ Got ${questions.length} AI-generated questions`);
      } else {
        console.warn('⚠️ Backend returned empty or error — falling back to mock. Error:', data.error);
        questions = fallbackQuestions;
        // Optionally pass error as a visual message
        if (data.error) alert(`AI Generation Error: ${data.error}. Falling back to default questions.`);
      }
    } catch (err) {
      console.warn('⚠️ Backend call failed — falling back to mock:', err.message);
      questions = fallbackQuestions;
    }
  } else {
    // 📋 Fallback to static questions (because server is down)
    console.warn('⚠️ Server down or API Key missing. Falling back to static questions.');
    await delay(1500);
    questions = fallbackQuestions;
  }

  proposals[idx].questions = questions;
  proposals[idx].status = 'questions_generated';
  proposals[idx].updatedAt = new Date().toISOString();
  saveProposals(proposals);
  return { success: true, data: questions };
}

// ─── SUBMIT ANSWERS ──────────────────────────────────────────────────────────

export async function submitAnswers(proposalId, answers) {
  await delay(800);
  const idx = proposals.findIndex((p) => p.id === proposalId);
  if (idx === -1) return { success: false, error: 'Proposal not found' };
  proposals[idx].answers = answers;
  proposals[idx].status = 'answers_submitted';
  proposals[idx].updatedAt = new Date().toISOString();
  saveProposals(proposals);
  return { success: true, data: { ...proposals[idx] } };
}

// ─── PDF / PROPOSAL GENERATION (Groq-powered with fallback) ─────────────────

export async function generateProposalPdf(proposalId) {
  const idx = proposals.findIndex((p) => p.id === proposalId);
  if (idx === -1) return { success: false, error: 'Proposal not found' };

  const proposal = proposals[idx];
  const backendUp = await isBackendAvailable();

  if (backendUp) {
    try {
      console.log('📄 Calling Groq for proposal generation...');
      const res = await fetch(`${API_BASE}/api/generate-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfpSummary: proposal.rfpSummary,
          title: proposal.title,
          clientName: proposal.clientName,
          industry: proposal.industry,
          questions: proposal.questions,
          answers: proposal.answers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        proposals[idx].generatedProposal = data.data;
        console.log('✅ AI proposal content generated');
      }
    } catch (err) {
      console.warn('⚠️ Proposal generation call failed:', err.message);
    }
  } else {
    await delay(3000);
  }

  proposals[idx].status = 'completed';
  proposals[idx].pdfUrl = `/api/proposals/${proposalId}/pdf`;
  proposals[idx].updatedAt = new Date().toISOString();
  saveProposals(proposals);
  return { success: true, data: { ...proposals[idx] } };
}

// ─── TIMER SYNC ──────────────────────────────────────────────────────────────

export async function getServerTime() {
  await delay(50);
  return { success: true, data: { serverTime: Date.now() } };
}
