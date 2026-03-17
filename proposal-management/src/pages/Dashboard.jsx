import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Zap, ArrowRight, Layers, Trash2,
} from 'lucide-react';
import { useProposals } from '../context/ProposalContext';
import './Dashboard.css';

const statusConfig = {
  draft: { label: 'Draft', badge: 'badge-warning', icon: Clock },
  rfp_submitted: { label: 'RFP Submitted', badge: 'badge-primary', icon: FileText },
  questions_generated: { label: 'Questions Ready', badge: 'badge-primary', icon: Zap },
  answers_submitted: { label: 'Answers Submitted', badge: 'badge-primary', icon: TrendingUp },
  completed: { label: 'Completed', badge: 'badge-success', icon: CheckCircle },
};

export default function Dashboard() {
  const { proposals, fetchProposals, removeProposal, loading } = useProposals();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const stats = {
    total: proposals.length,
    completed: proposals.filter((p) => p.status === 'completed').length,
    inProgress: proposals.filter((p) => p.status !== 'completed' && p.status !== 'draft').length,
    drafts: proposals.filter((p) => p.status === 'draft').length,
  };

  return (
    <div className="dashboard container animate-fade-in" id="dashboard-page">
      {/* Hero */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>
            Welcome to <span className="text-gradient">ProposalManager</span>
          </h1>
          <p className="dashboard-hero-desc">
            Create AI-powered proposals in minutes. Upload context, answer smart questions, and
            generate polished PDF proposals automatically.
          </p>
          <Link to="/proposals/new" className="btn btn-primary btn-lg" id="create-proposal-cta">
            <Plus size={18} /> Create New Proposal
          </Link>
        </div>
        <div className="dashboard-hero-visual">
          <div className="hero-glow" />
          <div className="hero-card-stack">
            <div className="hero-card hero-card-1"><Layers size={28} /></div>
            <div className="hero-card hero-card-2"><FileText size={24} /></div>
            <div className="hero-card hero-card-3"><Zap size={20} /></div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="dashboard-stats" id="stats-section">
        {[
          { label: 'Total Proposals', value: stats.total, icon: FileText, color: 'var(--color-primary)' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'var(--color-success)' },
          { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'var(--color-accent)' },
          { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'var(--color-warning)' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card card" key={stat.label}>
              <div className="stat-icon" style={{ background: `${stat.color}22`, color: stat.color }}>
                <Icon size={20} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* Recent Proposals */}
      <section className="dashboard-recent" id="recent-proposals">
        <div className="section-header">
          <h2>Recent Proposals</h2>
          {proposals.length > 0 && (
            <Link to="/proposals" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading && !proposals.length ? (
          <div className="dashboard-empty">
            <div className="spinner spinner-lg" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">
              <FileText size={40} />
            </div>
            <h3>No proposals yet</h3>
            <p>Create your first AI-powered proposal to get started.</p>
            <Link to="/proposals/new" className="btn btn-primary" id="create-first-proposal">
              <Plus size={16} /> Create Proposal
            </Link>
          </div>
        ) : (
          <div className="proposals-grid">
            {proposals.slice(0, 6).map((proposal) => {
              const cfg = statusConfig[proposal.status] || statusConfig.draft;
              const StatusIcon = cfg.icon;
              return (
                <div
                  className="proposal-card card card-hover"
                  key={proposal.id}
                  onClick={() => navigate(`/proposals/${proposal.id}`)}
                  id={`proposal-${proposal.id}`}
                >
                  <div className="proposal-card-top">
                    <span className={`badge ${cfg.badge}`}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProposal(proposal.id);
                      }}
                      title="Delete"
                      id={`delete-${proposal.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h3 className="proposal-card-title">{proposal.title}</h3>
                  <p className="proposal-card-client">{proposal.clientName}</p>
                  <div className="proposal-card-meta">
                    <span>{proposal.industry}</span>
                    <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="proposal-card-footer">
                    <span>{proposal.documents?.length || 0} docs</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
