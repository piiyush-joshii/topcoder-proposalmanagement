import { Injectable, Logger, BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { Proposal, Question } from './types';
import {
  getIndustryGuidance,
  QUESTION_SYSTEM_PROMPT,
  QUESTION_HUMAN_PROMPT,
  PROPOSAL_SYSTEM_PROMPT,
  PROPOSAL_HUMAN_PROMPT
} from '../prompts';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);
  private groqModel: ChatGroq;
  private proposals: Proposal[] = []; // Temporary in-memory storage for the challenge demo

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('groqApiKey');
    this.groqModel = new ChatGroq({
      apiKey,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });
  }

  async findAll(): Promise<Proposal[]> {
    return this.proposals;
  }

  async create(data: Partial<Proposal>): Promise<Proposal> {
    const proposal: Proposal = {
      id: Date.now().toString(),
      title: data.title || 'Untitled',
      clientName: data.clientName || 'Unknown',
      industry: data.industry || 'Other',
      status: data.status || ( 'draft' as any ),
      createdAt: new Date(),
      ...data,
    };
    this.proposals.push(proposal);
    return proposal;
  }

  async assess(id: string, rfpSummary: string): Promise<{ questions: Question[]; timerStartedAt: Date }> {
    const proposal = this.proposals.find(p => p.id === id);
    if (!proposal) throw new Error('Proposal not found');

    const industryGuidance = getIndustryGuidance(proposal.industry);
    const questionPrompt = ChatPromptTemplate.fromMessages([
      ['system', QUESTION_SYSTEM_PROMPT],
      ['human', QUESTION_HUMAN_PROMPT],
    ]);
    const chain = questionPrompt.pipe(this.groqModel).pipe(new JsonOutputParser());

    try {
      const result = await chain.invoke({
        rfpSummary,
        title: proposal.title,
        clientName: proposal.clientName,
        industry: proposal.industry,
        industryGuidance,
        documentContext: '',
      }) as { questions: Question[] };

      proposal.status = 'assessed' as any;
      proposal.rfpSummary = rfpSummary;
      proposal.timerStartedAt = new Date();
      proposal.questions = result.questions;
      
      return {
        questions: result.questions,
        timerStartedAt: proposal.timerStartedAt
      };
    } catch (error: any) {
      this.logger.error(`Gemini/Groq failure: ${error.message}`);
      if (error.message.includes('timeout')) throw new GatewayTimeoutException();
      throw new BadGatewayException('Failed to connect to AI service');
    }
  }

  async answer(id: string, answers: Record<string, string>): Promise<any> {
    const proposal = this.proposals.find(p => p.id === id);
    if (!proposal) throw new Error('Proposal not found');

    // Check timer (15 mins)
    if (proposal.timerStartedAt) {
      const elapsed = Date.now() - new Date(proposal.timerStartedAt).getTime();
      if (elapsed > 15 * 60 * 1000) {
        throw new BadGatewayException('Session expired. Please re-assess.');
      }
    }

    const proposalPrompt = ChatPromptTemplate.fromMessages([
      ['system', PROPOSAL_SYSTEM_PROMPT],
      ['human', PROPOSAL_HUMAN_PROMPT],
    ]);
    const chain = proposalPrompt.pipe(this.groqModel).pipe(new JsonOutputParser());

    const result = await chain.invoke({
      rfpSummary: proposal.rfpSummary,
      title: proposal.title,
      clientName: proposal.clientName,
      industry: proposal.industry,
      qaContext: JSON.stringify(answers),
    }) as any;

    proposal.status = 'completed' as any;
    proposal.answers = answers;
    proposal.generatedContent = result;
    
    return {
      ...(result as object),
      status: 'completed'
    };
  }
}
