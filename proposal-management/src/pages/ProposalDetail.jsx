import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Clock, CheckCircle, Download, Trash2,
  Calendar, Building2, Layers, MessageSquare, File,
} from 'lucide-react';
import { useProposals } from '../context/ProposalContext';
import PdfPreview from '../components/PdfPreview';
import './ProposalDetail.css';

const statusConfig = {
  draft: { label: 'Draft', badge: 'badge-warning', icon: Clock },
  rfp_submitted: { label: 'RFP Submitted', badge: 'badge-primary', icon: FileText },
  questions_generated: { label: 'Questions Ready', badge: 'badge-primary', icon: MessageSquare },
  answers_submitted: { label: 'Answers Submitted', badge: 'badge-primary', icon: Layers },
  completed: { label: 'Completed', badge: 'badge-success', icon: CheckCircle },
};

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProposal, fetchProposal, removeProposal, loading } = useProposals();

  useEffect(() => {
    if (id) fetchProposal(id);
  }, [id, fetchProposal]);

  const handleDelete = async () => {
    await removeProposal(id);
    navigate('/');
  };

  if (loading && !currentProposal) {
    return (
      <div className="detail-loading container">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!currentProposal) {
    return (
      <div className="detail-empty container">
        <h2>Proposal not found</h2>
        <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  const p = currentProposal;
  const cfg = statusConfig[p.status] || statusConfig.draft;
  const StatusIcon = cfg.icon;

  return (
    <div className="proposal-detail container animate-fade-in" id="proposal-detail-page">
      <div className="detail-top">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} id="detail-back-btn">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="detail-top-actions">
          {p.status !== 'completed' && (
            <Link to={`/proposals/${p.id}/edit`} className="btn btn-primary btn-sm" id="detail-resume-btn">
              Resume Proposal
            </Link>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleDelete} id="detail-delete-btn">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="detail-header">
        <div>
          <span className={`badge ${cfg.badge}`}>
            <StatusIcon size={12} /> {cfg.label}
          </span>
          <h1>{p.title}</h1>
          <p className="detail-client">{p.clientName}</p>
        </div>
      </div>

      <div className="detail-grid">
        {/* Info card */}
        <div className="card detail-info-card">
          <h3>Proposal Information</h3>
          <div className="detail-info-list">
            <div className="detail-info-item">
              <Building2 size={16} />
              <span className="detail-info-label">Industry</span>
              <span className="detail-info-value">{p.industry || '—'}</span>
            </div>
            <div className="detail-info-item">
              <Calendar size={16} />
              <span className="detail-info-label">Deadline</span>
              <span className="detail-info-value">
                {p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}
              </span>
            </div>
            <div className="detail-info-item">
              <Clock size={16} />
              <span className="detail-info-label">Created</span>
              <span className="detail-info-value">{new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-info-item">
              <Layers size={16} />
              <span className="detail-info-label">Documents</span>
              <span className="detail-info-value">{p.documents?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Documents card */}
        <div className="card detail-docs-card">
          <h3>Uploaded Documents</h3>
          {p.documents?.length > 0 ? (
            <div className="detail-docs-list">
              {p.documents.map((doc) => (
                <div key={doc.id} className="detail-doc-item">
                  <File size={16} className="detail-doc-icon" />
                  <div>
                    <p className="detail-doc-name">{doc.name}</p>
                    <p className="detail-doc-meta">
                      {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="detail-empty-text">No documents uploaded</p>
          )}
        </div>

        {/* RFP Summary */}
        {p.rfpSummary && (
          <div className="card detail-rfp-card">
            <h3>RFP Summary</h3>
            <p className="detail-rfp-text">{p.rfpSummary}</p>
          </div>
        )}

        {/* Answers */}
        {p.answers && Object.keys(p.answers).length > 0 && (
          <div className="card detail-answers-card">
            <h3>Clarifying Answers</h3>
            <div className="detail-answers-list">
              {p.questions?.map((q) => (
                p.answers[q.id] ? (
                  <div key={q.id} className="detail-answer-item">
                    <p className="detail-answer-question">{q.text}</p>
                    <p className="detail-answer-text">{p.answers[q.id]}</p>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* PDF Preview */}
        {p.status === 'completed' && (
          <div className="card detail-pdf-card">
            <PdfPreview proposal={p} />
          </div>
        )}
      </div>
    </div>
  );
}
