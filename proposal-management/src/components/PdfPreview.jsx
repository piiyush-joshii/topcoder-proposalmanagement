import { useRef } from 'react';
import { FileText, Download, ExternalLink, Sparkles } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './PdfPreview.css';

export default function PdfPreview({ proposal }) {
  if (!proposal) return null;

  const gen = proposal.generatedProposal; // AI-generated content (if available)

  const pdfRef = useRef(null);

  const handleDownload = () => {
    const element = pdfRef.current;
    if (!element) return;
    
    const safeTitle = (proposal?.title || 'Generated').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTitle}_Proposal.pdf`;
    
    const opt = {
      margin:       10,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Explicitly handle Blob creation and anchor clicks to fix filename drops
    html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a); // Required by some browsers to respect filename
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleOpenNewTab = () => {
    const content = generatePdfContent(proposal);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="pdf-preview" id="pdf-preview">
      <div className="pdf-preview-header">
        <div className="pdf-preview-icon">
          <FileText size={24} />
        </div>
        <div>
          <h3>Proposal Generated Successfully</h3>
          <p className="pdf-preview-sub">
            {gen ? 'AI-generated content powered by Groq' : 'Your proposal document is ready for review'}
          </p>
        </div>
        {gen && (
          <span className="badge badge-success">
            <Sparkles size={12} /> AI Generated
          </span>
        )}
      </div>

      <div className="pdf-preview-doc">
        <div className="pdf-preview-page" ref={pdfRef}>
          <div className="pdf-page-header">
            <div className="pdf-page-logo">PM</div>
            <span className="pdf-page-stamp">DRAFT</span>
          </div>
          <h2 className="pdf-page-title">{proposal.title}</h2>
          <p className="pdf-page-subtitle">Prepared for: {proposal.clientName}</p>
          <div className="pdf-page-divider" />

          {/* Executive Summary */}
          <div className="pdf-page-section">
            <h4>Executive Summary</h4>
            <p>{gen?.executiveSummary || proposal.rfpSummary || 'An executive summary based on the RFP analysis.'}</p>
          </div>

          {/* Problem Statement (AI) */}
          {gen?.problemStatement && (
            <div className="pdf-page-section">
              <h4>Problem Statement</h4>
              <p>{gen.problemStatement}</p>
            </div>
          )}

          {/* Proposed Solution (AI) */}
          {gen?.proposedSolution && (
            <div className="pdf-page-section">
              <h4>Proposed Solution</h4>
              <p>{gen.proposedSolution}</p>
            </div>
          )}

          {/* Key Benefits (AI) */}
          {gen?.keyBenefits?.length > 0 && (
            <div className="pdf-page-section">
              <h4>Key Benefits</h4>
              <ul className="pdf-page-list">
                {gen.keyBenefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}

          {/* Methodology (AI) */}
          {gen?.methodology && (
            <div className="pdf-page-section">
              <h4>Methodology</h4>
              <p>{gen.methodology}</p>
            </div>
          )}

          {/* Timeline (AI) */}
          {gen?.timeline && (
            <div className="pdf-page-section">
              <h4>Timeline</h4>
              <p>{gen.timeline}</p>
            </div>
          )}

          {/* Why Us (AI) */}
          {gen?.whyUs && (
            <div className="pdf-page-section">
              <h4>Why Choose Us</h4>
              <p>{gen.whyUs}</p>
            </div>
          )}

          {/* Fallback: show industry + docs when no AI content */}
          {!gen && (
            <>
              <div className="pdf-page-section">
                <h4>Industry</h4>
                <p>{proposal.industry}</p>
              </div>
              <div className="pdf-page-section">
                <h4>Documents Analyzed</h4>
                <p>{proposal.documents?.length || 0} context document(s) processed</p>
              </div>
              {proposal.answers && Object.keys(proposal.answers).length > 0 && (
                <div className="pdf-page-section">
                  <h4>Key Insights</h4>
                  <ul className="pdf-page-list">
                    {Object.entries(proposal.answers).slice(0, 3).map(([key, val]) => (
                      <li key={key}>{val}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="pdf-page-footer">
            <span>Generated by ProposalManager {gen ? '+ Groq AI' : ''}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="pdf-preview-actions">
        <button className="btn btn-primary" onClick={handleDownload} id="download-pdf-btn">
          <Download size={16} /> Download Proposal
        </button>
        <button className="btn btn-secondary" onClick={handleOpenNewTab} id="open-pdf-btn">
          <ExternalLink size={16} /> Open in New Tab
        </button>
      </div>
    </div>
  );
}

function generatePdfContent(proposal) {
  const gen = proposal.generatedProposal;

  const sections = [];

  sections.push(`
    <div class="section">
      <h2>Executive Summary</h2>
      <p>${gen?.executiveSummary || proposal.rfpSummary || 'Summary based on the RFP and context documents.'}</p>
    </div>`);

  if (gen?.problemStatement) {
    sections.push(`
    <div class="section">
      <h2>Problem Statement</h2>
      <p>${gen.problemStatement}</p>
    </div>`);
  }

  if (gen?.proposedSolution) {
    sections.push(`
    <div class="section">
      <h2>Proposed Solution</h2>
      <p>${gen.proposedSolution}</p>
    </div>`);
  }

  if (gen?.keyBenefits?.length) {
    sections.push(`
    <div class="section">
      <h2>Key Benefits</h2>
      <ul>${gen.keyBenefits.map((b) => `<li>${b}</li>`).join('')}</ul>
    </div>`);
  }

  if (gen?.methodology) {
    sections.push(`
    <div class="section">
      <h2>Methodology</h2>
      <p>${gen.methodology}</p>
    </div>`);
  }

  if (gen?.timeline) {
    sections.push(`
    <div class="section">
      <h2>Timeline</h2>
      <p>${gen.timeline}</p>
    </div>`);
  }

  if (gen?.whyUs) {
    sections.push(`
    <div class="section">
      <h2>Why Choose Us</h2>
      <p>${gen.whyUs}</p>
    </div>`);
  }

  if (!gen) {
    sections.push(`
    <div class="section">
      <h2>Documents</h2>
      <p>${proposal.documents?.length || 0} documents analyzed</p>
    </div>`);
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${proposal.title} - Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1e293b; line-height: 1.7; }
    h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; font-size: 28px; }
    h2 { color: #334155; margin-top: 30px; font-size: 20px; }
    .meta { color: #64748b; font-size: 14px; margin: 10px 0 30px; }
    .section { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #6366f1; }
    .section h2 { margin-top: 0; color: #4f46e5; }
    .section p { color: #475569; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; color: #475569; }
    .badge { display: inline-block; padding: 4px 12px; background: #ede9fe; color: #6366f1; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <h1>${proposal.title}</h1>
  <p class="meta">Prepared for: <strong>${proposal.clientName}</strong> | Industry: ${proposal.industry}</p>
  ${gen ? '<span class="badge">✨ AI-Generated Proposal</span>' : ''}
  ${sections.join('')}
  <div class="footer">
    <span>Generated by ProposalManager${gen ? ' + Groq AI' : ''}</span>
    <span>${new Date().toLocaleDateString()}</span>
  </div>
</body>
</html>`;
}
