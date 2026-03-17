/**
 * API Service — Proposal Management
 * Centralized API integration for Topcoder Challenge.
 */

const API_BASE = 'http://localhost:3001';

// Internal XHR utilities (matching Topcoder spec patterns)
const xhrPostAsync = async (url, body) => {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const xhrGetAsync = async (url) => {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ─── Proposal Service ────────────────────────────────────────────────────────

/**
 * Creates a new proposal via the backend API.
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export async function createProposal(data) {
  try {
    const response = await xhrPostAsync('/proposals', data);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all proposals from the server.
 * @returns {Promise<Object>}
 */
export async function getProposals() {
  try {
    const data = await xhrGetAsync('/proposals');
    return { success: true, data: data.reverse() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Submits the RFP summary and triggers AI assessment.
 * @param {string} proposalId 
 * @param {string} summary 
 */
export async function generateQuestions(proposalId, summary) {
  try {
    const data = await xhrPostAsync(`/proposals/${proposalId}/assess`, { summary });
    return { success: true, data: data.questions, timerStartedAt: data.timerStartedAt };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Submits answers and generates the final proposal content.
 * @param {string} proposalId 
 * @param {Object} answers 
 */
export async function generateProposalPdf(proposalId, answers) {
  try {
    const data = await xhrPostAsync(`/proposals/${proposalId}/answer`, { answers });
    return { success: true, data: { ...data, id: proposalId } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─── Local Mock Utilities (for frontend state) ───────────────────────────────

export async function getProposalById(id) {
  // In a full implementation, this calls GET /proposals/:id
  const list = await getProposals();
  const proposal = list.data?.find(p => p.id === id);
  if (!proposal) return { success: false, error: 'Not found' };
  return { success: true, data: proposal };
}

export async function uploadDocument(proposalId, file, onProgress) {
  // Mock upload logic (as real upload requires multipart form handling)
  onProgress(100);
  return { success: true };
}

export async function getServerTime() {
  return { success: true, data: { serverTime: Date.now() } };
}
