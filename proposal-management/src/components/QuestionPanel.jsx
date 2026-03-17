import { useState } from 'react';
import { Brain, ChevronRight, ChevronLeft, Send, Sparkles } from 'lucide-react';
import './QuestionPanel.css';

export default function QuestionPanel({ questions = [], onSubmit, loading = false }) {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(answers);
  };

  const allRequiredAnswered = questions
    .filter((q) => q.required === true || q.required === 'true')
    .every((q) => answers[q.id] && String(answers[q.id]).trim() !== '');

  if (!questions.length) return null;

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="question-panel" id="question-panel">
      <div className="question-header">
        <div className="question-header-icon">
          <Brain size={20} />
        </div>
        <div>
          <h3>AI-Generated Clarifying Questions</h3>
          <p className="question-header-sub">
            Answer these to help generate a better proposal
          </p>
        </div>
        <span className="badge badge-primary">
          <Sparkles size={12} /> AI Powered
        </span>
      </div>

      <div className="question-progress">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="question-progress-text">
          {currentQ + 1} of {questions.length}
        </span>
      </div>

      <div className="question-card animate-fade-in" key={q.id}>
        <div className="question-meta">
          <span className="badge badge-primary">{q.category}</span>
          {q.required && <span className="question-required">Required</span>}
        </div>
        <p className="question-text">{q.text}</p>

        {q.type === 'long_text' && (
          <textarea
            className="form-textarea"
            value={answers[q.id] || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Type your answer..."
            rows={4}
            id={`answer-${q.id}`}
          />
        )}
        {q.type === 'short_text' && (
          <input
            className="form-input"
            value={answers[q.id] || ''}
            onChange={(e) => handleChange(q.id, e.target.value)}
            placeholder="Type your answer..."
            id={`answer-${q.id}`}
          />
        )}
        {q.type === 'select' && (
          <div className="question-options">
            {q.options?.map((opt) => (
              <button
                key={opt}
                className={`question-option ${answers[q.id] === opt ? 'selected' : ''}`}
                onClick={() => handleChange(q.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="question-nav">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((c) => c - 1)}
          id="prev-question-btn"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setCurrentQ((c) => c + 1)}
            id="next-question-btn"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            disabled={!allRequiredAnswered || loading}
            onClick={handleSubmit}
            id="submit-answers-btn"
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Submitting...</>
            ) : (
              <><Send size={16} /> Submit Answers</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
