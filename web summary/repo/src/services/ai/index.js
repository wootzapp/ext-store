// src/services/ai/index.js
import { BACKEND_BASE_URL } from '@/config/backend';
import * as backend from './providers/backend';
import * as openai from './providers/openai';
import * as anthropic from './providers/anthropic';
import * as gemini from './providers/gemini';
import { ensureMarkdown } from './markdown';
import StorageUtils, { SUPPORTED_MODELS } from '@/storage';
export { buildPrompt } from '@/services/ai/promptBuilder';

function buildRequest(kind, payload, conversationHistory = [], currentUrl) {
  try {
    const prompt = (typeof window !== 'undefined' ? require('@/services/ai/promptBuilder') : null)?.buildPrompt?.(kind, payload, conversationHistory, currentUrl);
    if (prompt) return { kind, prompt, payload, conversationHistory };
  } catch {}
  
  // Fallback prompts based on kind
  let prompt;
  switch (kind) {
    case 'chat':
      const { message } = payload || {};
      
      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        console.log('🔧 Fallback - Building conversation context from:', conversationHistory);
        conversationContext = '\n\n**Previous Conversation Context:**\n';
        conversationHistory.slice(-6).forEach((msg, index) => {
          const role = msg.type === 'user' ? 'User' : 'Assistant';
          conversationContext += `${role}: ${msg.content}\n`;
        });
        conversationContext += '\n**Current Message:**';
        console.log('🔧 Fallback - Built context:', conversationContext);
      } else {
        console.log('🔧 Fallback - No conversation history available');
      }
      
      prompt = `You are Wootz AI, an intelligent AI assistant specialized in web content analysis, research, and fact-checking. You have access to real-time web data and can analyze current pages.

**CURRENT PAGE CONTEXT:**
- Current URL: ${currentUrl || 'Not available'}
- You can reference this page in your responses when relevant

**KNOWLEDGE & CAPABILITIES:**
- **Real-time Data Access**: You have access to current web information and can analyze live web pages
- **Web Analysis**: Can analyze webpage content, structure, and key insights
- **Research Expertise**: Can conduct comprehensive research on any topic with credible sources
- **Fact-Checking**: Can verify claims against trusted sources and identify misinformation
- **Contextual Understanding**: Use conversation history to provide relevant, connected responses

**RESPONSE GUIDELINES:**
- ALWAYS respond to the user's actual question or request directly and completely
- NEVER say "your question might be missing" or similar generic responses
- Be conversational, friendly, and genuinely helpful
- Use markdown formatting appropriately (headings, lists, code blocks, links)
- Provide detailed, well-structured responses with examples when helpful
- Ask thoughtful follow-up questions that add value
- Offer relevant features (page analysis, research, fact-checking) when appropriate
- Use conversation history to maintain context and provide connected responses
- Be engaging and show genuine interest in helping the user
- End responses naturally without forced sign-offs or repetitive phrases

**INTELLIGENT RESPONSE STRATEGY:**
- Analyze the user's intent and provide the most helpful response
- If the question is about web content, offer to analyze the current page
- If the question needs research, suggest the research feature
- If the question involves fact-checking, mention the fact-checker feature
- Connect current messages to previous conversation context when relevant
- Provide actionable insights and practical next steps when appropriate
${conversationContext}
**User Message:** ${message || 'Hello'}

**Response:**
Provide a helpful, direct, and intelligent answer to the user's question above. Use the conversation context to provide relevant, connected responses. Do not ask if the question is missing - answer what they asked with depth and insight.`;
      break;
    case 'research':
      const { topic, depth = 'comprehensive' } = payload || {};
      prompt = `# Research Task\nTopic: ${topic}\nDepth: ${depth}\n\nReturn a well-structured Markdown report with sections, bullet points, and links.`;
      break;
    case 'pageAnalysis':
      const { url } = payload || {};
      prompt = `# Page Analysis\nURL: ${url}\n\nAnalyze this webpage and provide a comprehensive summary with key insights, main points, and FAQs.`;
      break;
    case 'factCheck':
      const { url: factUrl } = payload || {};
      prompt = `# Fact Check\nURL: ${factUrl}\n\nFact-check the claims made on this webpage and verify their accuracy against trusted sources.`;
      break;
    default:
      prompt = `You are a helpful AI assistant. Please respond to: ${JSON.stringify(payload)}`;
  }
  
  return { kind, prompt, payload, conversationHistory };
}

function pickProvider({ useOwnKey, selectedModel }) {
  if (!useOwnKey) return { type: 'backend', impl: backend };
  switch (selectedModel) {
    case 'openai':    return { type: 'openai', impl: openai };
    case 'anthropic': return { type: 'anthropic', impl: anthropic };
    case 'gemini':    return { type: 'gemini', impl: gemini };
    default:          return { type: 'backend', impl: backend };
  }
}

/**
 * stream({ kind, payload, signal, onDelta, route?, onProvider?, conversationHistory? })
 * route: { useOwnKey: boolean, selectedModel?: string, apiKey?: string }
 * conversationHistory: Array of { role: 'user'|'assistant', content: string }
 */
export async function stream({ kind, payload, signal, onDelta, route, onProvider, conversationHistory = [], currentUrl }) {
  // Prefer explicit route from caller (the hook). If absent, make a minimal read from *local*.
  let useOwnKey = route?.useOwnKey;
  let selectedModel = route?.selectedModel;
  let apiKey = route?.apiKey;

  if (useOwnKey == null) {
    // single-source-of-truth in your project is chrome.storage.local
    useOwnKey = !!(await StorageUtils.getUseOwnKey());
  }
  if (!selectedModel) selectedModel = await StorageUtils.getSelectedModel();
  if (!apiKey && selectedModel) apiKey = await StorageUtils.getApiKey(selectedModel);

  const provider = pickProvider({ useOwnKey, selectedModel });
  onProvider?.(provider.type, { useOwnKey, selectedModel });

  console.log('🔧 AI Service - Conversation History:', conversationHistory);
  console.log('🔧 AI Service - History Length:', conversationHistory?.length || 0);
  console.log('🔧 AI Service - Current URL:', currentUrl);
  
  const req = buildRequest(kind, payload, conversationHistory, currentUrl);
  console.log('🔧 AI Service - Built Request:', { kind, payload: req.payload, hasHistory: !!req.conversationHistory, currentUrl });
  
  const ctx = {
    apiKey,
    modelConfig: SUPPORTED_MODELS?.[selectedModel] || {},
    backendBaseUrl: BACKEND_BASE_URL,
    signal,
  };

  const gen = provider.impl.stream({ kind, req, ctx });

  let full = '';
  for await (const chunk of gen) {
    const md = ensureMarkdown(chunk);
    full += md;
    onDelta?.(md);
  }
  return { fullText: full };
}

export default { stream };
