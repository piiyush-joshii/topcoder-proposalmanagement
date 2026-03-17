import { Check } from 'lucide-react';
import './Stepper.css';

const defaultSteps = [
  'Create Proposal',
  'Upload Documents',
  'RFP Summary',
  'AI Questions',
  'Generate PDF',
];

export default function Stepper({ steps = defaultSteps, currentStep = 0 }) {
  return (
    <div className="stepper" id="workflow-stepper">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={i} className="stepper-item">
            <div className="stepper-step">
              <div
                className={`stepper-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {isCompleted ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`stepper-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
