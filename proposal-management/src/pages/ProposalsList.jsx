import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, FileText, Clock, CheckCircle, TrendingUp, Zap, Trash2, ArrowRight,
  Filter,
} from 'lucide-react';
import { useProposals } from '../context/ProposalContext';
import './ProposalsList.css';

const statusConfig = {
  draft: { label: 'Draft', badge: 'badge-warning', icon: Clock },
  rfp_submitted: { label: 'RFP Submitted', badge: 'badge-primary', icon: FileText },
  questions_generated: { label: 'Questions Ready', badge: 'badge-primary', icon: Zap },
  answers_submitted: { label: 'Answers Submitted', badge: 'badge-primary', icon: TrendingUp },
  completed: { label: 'Completed', badge: 'badge-success', icon: CheckCircle },
};

export default function ProposalsList() {
  const { proposals, fetchProposals, removeProposal, loading } = useProposals();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const filtered = proposals.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="proposals-list container animate-fade-in" id="proposals-list-page">
      <div className="list-header">
        <h1>All Proposals</h1>
        <Link to="/proposals/new" className="btn btn-primary" id="new-proposal-btn">
          <Plus size={16} /> New Proposal
        </Link>
      </div>

      <div className="list-filters">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-proposals"
          />
        </div>
        <div className="filter-pills">
          {['all', 'draft', 'rfp_submitted', 'completed'].map((s) => (
            <button
              key={s}
              className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading && !proposals.length && (
        <div className="list-empty">
          <div className="spinner spinner-lg" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="list-empty">
          <div className="empty-icon">
            <FileText size={40} />
          </div>
          <h3>No proposals found</h3>
          <p>
            {search || filterStatus !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Create your first proposal to get started.'}
          </p>
          {!search && filterStatus === 'all' && (
            <Link to="/proposals/new" className="btn btn-primary">
              <Plus size={16} /> Create Proposal
            </Link>
          )}
        </div>
      )}

      <div className="proposals-table-wrapper">
        {filtered.length > 0 && (
          <table className="proposals-table" id="proposals-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cfg = statusConfig[p.status] || statusConfig.draft;
                const StatusIcon = cfg.icon;
                return (
                  <tr
                    key={p.id}
                    className="table-row"
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <td className="table-title">
                      <FileText size={16} className="table-title-icon" />
                      {p.title}
                    </td>
                    <td>{p.clientName}</td>
                    <td>{p.industry || '—'}</td>
                    <td>
                      <span className={`badge ${cfg.badge}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                    </td>
                    <td className="table-date">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/proposals/${p.id}`);
                          }}
                          title="View"
                        >
                          <ArrowRight size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProposal(p.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
