export enum ProposalStatus {
  DRAFT = 'draft',
  ASSESSED = 'assessed',
  QUESTIONS_GENERATED = 'questions_generated',
  ANSWERS_SUBMITTED = 'answers_submitted',
  COMPLETED = 'completed',
}

export interface Question {
  id: string;
  text: string;
  type: 'long_text' | 'short_text' | 'select';
  required: boolean;
  category: string;
  options?: string[];
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  deadline?: string;
  rfpSummary?: string;
  status: ProposalStatus;
  questions?: Question[];
  answers?: Record<string, string>;
  generatedContent?: any;
  timerStartedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
