import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Sparkles, FileText, Send, Loader,
} from 'lucide-react';
import Stepper from '../components/Stepper';
import FileUpload from '../components/FileUpload';
import QuestionPanel from '../components/QuestionPanel';
import PdfPreview from '../components/PdfPreview';
import { useProposals } from '../context/ProposalContext';
import './CreateProposal.css';

const STEPS = [
  'Proposal Details',
  'Upload Documents',
  'RFP Summary',
  'AI Questions',
  'Generate PDF',
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const {
    currentProposal,
    fetchProposal,
    loading,
    uploadProgress,
    createProposal,
    uploadDocument,
    submitRfpSummary,
    generateQuestions,
    submitAnswers,
    generatePdf,
  } = useProposals();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    clientName: '',
    industry: '',
    deadline: '',
  });
  const [rfpSummary, setRfpSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);

  // Fetch proposal if resuming
  useEffect(() => {
    if (id) fetchProposal(id);
  }, [id, fetchProposal]);

  // Hydrate step and form state exactly once when the existing proposal loads
  useEffect(() => {
    if (id && currentProposal && currentProposal.id === id && !hasResumed) {
      setForm({
        title: currentProposal.title || '',
        clientName: currentProposal.clientName || '',
        industry: currentProposal.industry || '',
        deadline: currentProposal.deadline || '',
      });
      setRfpSummary(currentProposal.rfpSummary || '');
      
      const s = currentProposal.status;
      if (s === 'draft') setStep(1); 
      else if (s === 'rfp_submitted') setStep(2);
      else if (s === 'questions_generated') setStep(3);
      else if (s === 'answers_submitted' || s === 'completed') setStep(4);
      
      setHasResumed(true);
    }
  }, [id, currentProposal, hasResumed]);

  // Step 0: Create proposal
  const handleCreateProposal = async () => {
    if (!form.title || !form.clientName) return;
    const proposal = await createProposal(form);
    if (proposal) setStep(1);
  };

  // Step 1: File upload
  const handleFilesSelected = useCallback(async (files) => {
    if (!currentProposal) return;
    for (const file of files) {
      await uploadDocument(currentProposal.id, file);
    }
  }, [currentProposal, uploadDocument]);

  // Step 2: RFP Summary
  const handleSubmitRfp = async () => {
    if (!currentProposal || !rfpSummary.trim()) return;
    const res = await submitRfpSummary(currentProposal.id, rfpSummary);
    if (res.success) {
      setGenerating(true);
      const qRes = await generateQuestions(currentProposal.id, rfpSummary);
      setGenerating(false);
      if (qRes.success) setStep(3);
    }
  };

  // Step 3: Submit answers
  const handleSubmitAnswers = async (answers) => {
    if (!currentProposal) return;
    const res = await submitAnswers(currentProposal.id, answers);
    if (res.success) setStep(4);
  };

  // Step 4: Generate PDF
  const handleGeneratePdf = async () => {
    if (!currentProposal) return;
    setGeneratingPdf(true);
    await generatePdf(currentProposal.id, currentProposal.answers);
    setGeneratingPdf(false);
  };

  const canProceedStep0 = form.title.trim() && form.clientName.trim();

  return (
    <div className="create-proposal container animate-fade-in" id="create-proposal-page">
      <div className="create-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Create New Proposal</h1>
      </div>

      <Stepper steps={STEPS} currentStep={step} />

      <div className="create-body">
        {/* Step 0: Proposal Details */}
        {step === 0 && (
          <div className="step-content animate-slide-up" id="step-details">
            <div className="step-intro">
              <h2>Proposal Details</h2>
              <p>Provide the basic information for your proposal.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Proposal Title *</label>
                <input
                  className="form-input"
                  id="title"
                  placeholder="e.g., Cloud Migration Strategy for Acme Corp"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="clientName">Client Name *</label>
                <input
                  className="form-input"
                  id="clientName"
                  placeholder="e.g., Acme Corporation"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="industry">Industry</label>
                <select
                  className="form-select"
                  id="industry"
                  value={form.industry}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                >
                  <option value="">Select industry...</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="deadline">Deadline</label>
                <input
                  className="form-input"
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="step-actions">
              <div />
              <button
                className="btn btn-primary"
                disabled={!canProceedStep0 || loading}
                onClick={handleCreateProposal}
                id="next-step-0"
              >
                {loading ? (
                  <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating...</>
                ) : (
                  <>Next: Upload Documents <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Upload Documents */}
        {step === 1 && (
          <div className="step-content animate-slide-up" id="step-upload">
            <div className="step-intro">
              <h2>Upload Context Documents</h2>
              <p>
                Upload relevant documents to provide context for the proposal generation.
                These could be RFP documents, technical specs, or any reference materials.
              </p>
            </div>

            <FileUpload
              onFilesSelected={handleFilesSelected}
              uploadProgress={uploadProgress}
              uploadedFiles={currentProposal?.documents || []}
            />

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(0)} id="back-step-1">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
                id="next-step-1"
              >
                Next: RFP Summary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: RFP Summary */}
        {step === 2 && (
          <div className="step-content animate-slide-up" id="step-rfp">
            <div className="step-intro">
              <h2>RFP Summary</h2>
              <p>
                Provide a summary of the Request for Proposal (RFP). This will be used by
                the AI to generate relevant clarifying questions.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rfpSummary">RFP Summary *</label>
              <textarea
                className="form-textarea"
                id="rfpSummary"
                rows={8}
                placeholder="Describe the key requirements, objectives, and scope of the RFP..."
                value={rfpSummary}
                onChange={(e) => setRfpSummary(e.target.value)}
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)} id="back-step-2">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="btn btn-primary"
                disabled={!rfpSummary.trim() || loading || generating}
                onClick={handleSubmitRfp}
                id="submit-rfp-btn"
              >
                {loading || generating ? (
                  <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> <Sparkles size={16} /> Generating Questions...</>
                ) : (
                  <><Send size={16} /> Submit & Generate Questions</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Questions */}
        {step === 3 && (
          <div className="step-content animate-slide-up" id="step-questions">
            <QuestionPanel
              questions={currentProposal?.questions || []}
              onSubmit={handleSubmitAnswers}
              loading={loading}
            />

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(2)} id="back-step-3">
                <ArrowLeft size={16} /> Back
              </button>
              <div /> {/* QuestionPanel has its own submit button */}
            </div>
          </div>
        )}

        {/* Step 4: Generate PDF */}
        {step === 4 && (
          <div className="step-content animate-slide-up" id="step-pdf">
            {currentProposal?.status !== 'completed' ? (
              <div className="generate-section">
                <div className="generate-icon-wrapper">
                  <div className="generate-icon">
                    <FileText size={36} />
                  </div>
                </div>
                <h2>Ready to Generate Your Proposal</h2>
                <p className="generate-desc">
                  All information has been collected. Click below to generate your polished
                  PDF proposal document using AI.
                </p>

                {generatingPdf && (
                  <div className="generating-indicator">
                    <div className="spinner spinner-lg" />
                    <p>Generating your proposal...</p>
                    <p className="generating-sub">This may take a few moments</p>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  disabled={generatingPdf}
                  onClick={handleGeneratePdf}
                  id="generate-pdf-btn"
                >
                  {generatingPdf ? (
                    <><Loader size={18} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles size={18} /> Generate Proposal PDF</>
                  )}
                </button>
              </div>
            ) : (
              <PdfPreview proposal={currentProposal} />
            )}

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(3)} id="back-step-4">
                <ArrowLeft size={16} /> Back
              </button>
              {currentProposal?.status === 'completed' && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                  id="finish-btn"
                >
                  Back to Dashboard <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
