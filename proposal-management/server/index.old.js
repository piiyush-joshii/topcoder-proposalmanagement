import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  getIndustryGuidance,
  QUESTION_SYSTEM_PROMPT,
  QUESTION_HUMAN_PROMPT,
  PROPOSAL_SYSTEM_PROMPT,
  PROPOSAL_HUMAN_PROMPT
} from './prompts.js';

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

// ─── LangChain + Groq Setup ──────────────────────────────────────────────────

const primaryModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',   // fast + smart
  temperature: 0.4,
  maxTokens: 4096,
});

const fallbackModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'mixtral-8x7b-32768',   //  fallback on Groq
  temperature: 0.4,
  maxTokens: 4096,
});

const groqModel = primaryModel.withFallbacks({
  fallbacks: [fallbackModel],
});

// ─── Question Generation Chain ───────────────────────────────────────────────

const questionPrompt = ChatPromptTemplate.fromMessages([
  ['system', QUESTION_SYSTEM_PROMPT],
  ['human', QUESTION_HUMAN_PROMPT],
]);

const outputParser = new JsonOutputParser();

const questionChain = questionPrompt.pipe(groqModel).pipe(outputParser);

// ─── Proposal Enhancement Chain ──────────────────────────────────────────────

const proposalPrompt = ChatPromptTemplate.fromMessages([
  ['system', PROPOSAL_SYSTEM_PROMPT],
  ['human', PROPOSAL_HUMAN_PROMPT],
]);

const proposalChain = proposalPrompt.pipe(groqModel).pipe(outputParser);

// ─── API Routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/generate-questions
 * Body: { rfpSummary, title, clientName, industry, documents? }
 */
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { rfpSummary, title, clientName, industry, documents } = req.body;

    if (!rfpSummary) {
      return res.status(400).json({ success: false, error: 'RFP summary is required' });
    }

    console.log(`\n🧠 Generating questions for: "${title}"`);
    console.log(`   Client: ${clientName} | Industry: ${industry}`);
    console.log(`   RFP length: ${rfpSummary.length} chars`);

    // Build document context if any document names/content provided
    let documentContext = '';
    if (documents && documents.length > 0) {
      const docNames = documents.map((d) => d.name).join(', ');
      documentContext = `\nUploaded reference documents: ${docNames}\nConsider the types of documents uploaded when generating questions.`;
    }

    // Extract customized industry rules to inject into system prompt
    const industryGuidance = getIndustryGuidance(industry);

    const result = await questionChain.invoke({
      rfpSummary,
      title: title || 'Untitled Proposal',
      clientName: clientName || 'Unknown Client',
      industry: industry || 'General',
      industryGuidance,
      documentContext,
    });

    console.log(`   ✅ Generated ${result.questions?.length || 0} questions`);

    // Ensure each question has an id
    const questions = (result.questions || []).map((q, i) => ({
      ...q,
      id: q.id || `q${i + 1}`,
    }));

    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('❌ Question generation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate questions. Check your GROQ_API_KEY.',
      details: error.message,
    });
  }
});

/**
 * POST /api/generate-proposal
 * Body: { rfpSummary, title, clientName, industry, questions, answers }
 */
app.post('/api/generate-proposal', async (req, res) => {
  try {
    const { rfpSummary, title, clientName, industry, questions, answers } = req.body;

    if (!rfpSummary) {
      return res.status(400).json({ success: false, error: 'RFP summary is required' });
    }

    console.log(`\n📄 Generating proposal for: "${title}"`);

    // Build Q&A context
    let qaContext = 'No clarifying questions were answered.';
    if (questions && answers && Object.keys(answers).length > 0) {
      qaContext = questions
        .filter((q) => answers[q.id])
        .map((q) => `Q: ${q.text}\nA: ${answers[q.id]}`)
        .join('\n\n');
    }

    const result = await proposalChain.invoke({
      rfpSummary,
      title: title || 'Untitled Proposal',
      clientName: clientName || 'Unknown Client',
      industry: industry || 'General',
      qaContext,
    });

    console.log('   ✅ Proposal generated successfully');

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Proposal generation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate proposal.',
      details: error.message,
    });
  }
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here',
    model: 'llama-3.3-70b-versatile',
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Proposal Management API running on http://localhost:${PORT}`);
  console.log(`   Primary Model: llama-3.3-70b-versatile (via Groq)`);
  console.log(`   Fallback Model: mixtral-8x7b-32768 (via Groq)`);

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.log('\n⚠️  GROQ_API_KEY not set! Add it to .env file.');
    console.log('   Get a key at: https://console.groq.com/keys\n');
  } else {
    console.log('   ✅ Groq API key configured\n');
  }
});
