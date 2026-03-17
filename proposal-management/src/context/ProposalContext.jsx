import { createContext, useContext, useReducer, useCallback } from 'react';
import * as api from '../services/api';

const ProposalContext = createContext(null);

const initialState = {
  proposals: [],
  currentProposal: null,
  loading: false,
  error: null,
  uploadProgress: {},  // { [docId]: number }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROPOSALS':
      return { ...state, proposals: action.payload, loading: false };
    case 'SET_CURRENT':
      return { ...state, currentProposal: action.payload, loading: false };
    case 'UPDATE_CURRENT':
      return {
        ...state,
        currentProposal: { ...state.currentProposal, ...action.payload },
        loading: false,
      };
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: { ...state.uploadProgress, [action.payload.id]: action.payload.progress },
      };
    case 'CLEAR_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: {} };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function ProposalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ---- Actions ----

  const fetchProposals = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.getProposals();
      if (res.success) dispatch({ type: 'SET_PROPOSALS', payload: res.data });
      else dispatch({ type: 'SET_ERROR', payload: res.error });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, []);

  const fetchProposal = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.getProposalById(id);
      if (res.success) dispatch({ type: 'SET_CURRENT', payload: res.data });
      else dispatch({ type: 'SET_ERROR', payload: res.error });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, []);

  const createProposal = useCallback(async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.createProposal(data);
      if (res.success) {
        dispatch({ type: 'SET_CURRENT', payload: res.data });
        return res.data;
      }
      dispatch({ type: 'SET_ERROR', payload: res.error });
      return null;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return null;
    }
  }, []);

  const uploadDocument = useCallback(async (proposalId, file) => {
    const tmpId = `upload-${Date.now()}`;
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: { id: tmpId, progress: 0 } });
    try {
      const res = await api.uploadDocument(proposalId, file, (progress) => {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: { id: tmpId, progress } });
      });
      if (res.success) {
        // refresh current proposal
        const pRes = await api.getProposalById(proposalId);
        if (pRes.success) dispatch({ type: 'SET_CURRENT', payload: pRes.data });
      }
      return res;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return { success: false, error: e.message };
    }
  }, []);

  const submitRfpSummary = useCallback(async (proposalId, summary) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.submitRfpSummary(proposalId, summary);
      if (res.success) dispatch({ type: 'SET_CURRENT', payload: res.data });
      else dispatch({ type: 'SET_ERROR', payload: res.error });
      return res;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return { success: false };
    }
  }, []);

  const generateQuestions = useCallback(async (proposalId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.generateQuestions(proposalId);
      if (res.success) {
        const pRes = await api.getProposalById(proposalId);
        if (pRes.success) dispatch({ type: 'SET_CURRENT', payload: pRes.data });
        return res;
      }
      dispatch({ type: 'SET_ERROR', payload: res.error });
      return res;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return { success: false };
    }
  }, []);

  const submitAnswers = useCallback(async (proposalId, answers) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.submitAnswers(proposalId, answers);
      if (res.success) dispatch({ type: 'SET_CURRENT', payload: res.data });
      else dispatch({ type: 'SET_ERROR', payload: res.error });
      return res;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return { success: false };
    }
  }, []);

  const generatePdf = useCallback(async (proposalId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.generateProposalPdf(proposalId);
      if (res.success) dispatch({ type: 'SET_CURRENT', payload: res.data });
      else dispatch({ type: 'SET_ERROR', payload: res.error });
      return res;
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
      return { success: false };
    }
  }, []);

  const removeProposal = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.deleteProposal(id);
      if (res.success) await fetchProposals();
      else dispatch({ type: 'SET_ERROR', payload: res.error });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [fetchProposals]);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const clearUploadProgress = useCallback(() => dispatch({ type: 'CLEAR_UPLOAD_PROGRESS' }), []);

  const value = {
    ...state,
    fetchProposals,
    fetchProposal,
    createProposal,
    uploadDocument,
    submitRfpSummary,
    generateQuestions,
    submitAnswers,
    generatePdf,
    removeProposal,
    clearError,
    clearUploadProgress,
  };

  return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>;
}

export function useProposals() {
  const ctx = useContext(ProposalContext);
  if (!ctx) throw new Error('useProposals must be used within ProposalProvider');
  return ctx;
}
