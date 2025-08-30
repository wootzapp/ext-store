// services/ai/promptBuilder.js

/**
 * PromptBuilder (Markdown-only)
 * ---------------------------------------
 * - Centralizes all prompt templates
 * - Returns a single markdown-ready string
 * - Provider-agnostic, backend-friendly, stream-friendly
 *
 * Usage:
 *   import { buildPrompt } from '@/services/ai/promptBuilder';
 *   const prompt = buildPrompt('chat', { userMessage: 'Hello!' });
 */

const DEFAULTS = {
    tone: 'friendly',        // 'friendly' | 'neutral' | 'expert'
    audience: 'general',     // free text, e.g. 'developers', 'non-technical users'
    styleHints: [
      'Use Markdown formatting (headings, lists, tables, code fences when helpful).',
      'Prefer short paragraphs and bullet points.',
      'Be precise; if unsure, say you’re unsure and suggest what’s needed.',
      'Avoid filler like “As an AI…”.',
      'Start directly with the requested content. Do NOT add greetings, prefaces, or meta lines like “Okay,” “Here is a summary,” “Sure,” or “I will…”.',
      'Output ONLY the Markdown sections requested—no extra commentary before or after.',
    ],
    maxWordsSummary50: 50,
  };
  
  const ResearchDepth = {
    quick:         { maxSources: 5,  description: 'Quick overview with essential sources.' },
    comprehensive: { maxSources: 10, description: 'Balanced research with a good variety of sources.' },
    expert:        { maxSources: 15, description: 'Deep, specialized research with extensive sources.' },
  };
  
  // -------------------------- helpers --------------------------
  
  const joinBullets = (arr) => arr.map(s => `- ${s}`).join('\n');
  
  const sharedDirectives = (opts = {}) => {
    const tone = opts.tone || DEFAULTS.tone;
    const audience = opts.audience || DEFAULTS.audience;
    return [
      `**Role:** You are a helpful assistant for a browser extension.`,
      `**Tone:** ${tone}. **Audience:** ${audience}.`,
      joinBullets(DEFAULTS.styleHints),
    ].join('\n');
  };
  
  // -------------------------- templates --------------------------
  
  function chatTemplate({ userMessage }, opts = {}) {
    return [
      sharedDirectives(opts),
      '',
      '### Task',
      'Respond helpfully and succinctly to the user message below.',
      '',
      '### User Message',
      userMessage || '',
      '',
      '### Requirements',
      joinBullets([
        'Answer directly and clearly.',
        'Keep it concise; use bullets when appropriate.',
        'No introductions or closing remarks; start with the answer itself.',
      ]),
    ].join('\n');
  }
  
  function pageAnalysisTemplate({ url }, opts = {}) {
    const limit = DEFAULTS.maxWordsSummary50;
    return [
      sharedDirectives(opts),
      '',
      '### Task',
      `Analyze the webpage and produce a short summary and FAQs (Markdown).`,
      '',
      '### Input',
      `- **URL:** ${url}`,
      '',
      '### Output Format (Markdown)',
      joinBullets([
        `Begin immediately with \`## Summary\`.`,
        `**Summary** (≤ ${limit} words) as a single paragraph.`,
        `Then \`## FAQs\` with exactly 5 items.`,
        'Each FAQ: **bold question** followed by a clear answer.',
        'Answers should be based only on the page content; if unknown, say so.',
        'No preface like “Okay, here is a summary” and no closing lines.',
      ]),
      '',
      '### Notes',
      joinBullets([
        'Do not invent details that aren’t present on the page.',
        'Prefer bullets, short sentences, and clear structure.',
      ]),
    ].join('\n');
  }
  
  function researchTemplate({ topic, depth = 'comprehensive' }, opts = {}) {
    const cfg = ResearchDepth[depth] || ResearchDepth.comprehensive;
    return [
      sharedDirectives(opts),
      '',
      '### Task',
      `Research **${topic}** and present findings in Markdown.`,
      '',
      '### Depth',
      `- ${depth} — ${cfg.description} (aim for up to ${cfg.maxSources} high-quality sources)`,
      '',
      '### Output Structure (Markdown)',
      joinBullets([
        'Start with `## Overview` (2–3 sentences).',
        '`## Key Findings` — 5–10 bullet points.',
        '`## Nuances & Trade-offs` — bullets listing caveats/limitations.',
        '`## Practical Takeaways` — bullets with actionable advice.',
        '`## Sources` — list 6–12 items mixing academic/official/credible media.',
        'Each source: title, author/org, year, and a markdown link.',
        'No preface (e.g., “Okay, here’s a summary”) and no outro.',
      ]),
      '',
      '### Requirements',
      joinBullets([
        'Favor recent and reputable sources; avoid low-credibility blogs.',
        'If evidence conflicts, call it out explicitly.',
        'If a claim is uncertain, label it clearly.',
      ]),
    ].join('\n');
  }
  
  function factCheckTemplate({ url }, opts = {}) {
    return [
      sharedDirectives(opts),
      '',
      '### Task',
      `Fact-check the claims made at: ${url}`,
      '',
      '### Output Structure (Markdown)',
      joinBullets([
        'Start with `## Overall Assessment` — short paragraph describing credibility.',
        '`## Credibility Signals` — bullets (author, sourcing, date, expertise, bias).',
        '`## Verified Claims` — bullet list (quote/paraphrase the claim, then evidence + link).',
        '`## Disputed/Unclear Claims` — bullet list with what’s missing to verify.',
        '`## False or Misleading Claims` — bullet list with counter-evidence.',
        '`## Sources Used` — bullet list with markdown links and brief rationale.',
        'No preface or closing remarks.',
      ]),
      '',
      '### Rules',
      joinBullets([
        'Be specific. Quote or paraphrase concrete claims before judging them.',
        'Use only reliable evidence; link to sources.',
        'If the page lacks enough info, say exactly what is missing.',
      ]),
    ].join('\n');
  }
  
  function faqOnlyTemplate({ content, url, title }, opts = {}) {
    const safeContent = (content || '').slice(0, 20_000);
    return [
      sharedDirectives(opts),
      '',
      '### Task',
      'Generate **exactly 5 FAQs** from the provided content (Markdown).',
      '',
      '### Context',
      url ? `- **URL:** ${url}` : null,
      title ? `- **Title:** ${title}` : null,
      '',
      '### Content (truncated)',
      '```',
      safeContent,
      '```',
      '',
      '### Output Rules',
      joinBullets([
        'Begin with `## FAQs`.',
        'Each FAQ: **bold question** followed by a clear answer.',
        'Base answers only on the provided content; if unknown, say so.',
        'No extra commentary, introductions, or closing lines.',
      ]),
    ].filter(Boolean).join('\n');
  }
  
  // -------------------------- multiplexer --------------------------
  
  /**
   * buildPrompt(kind, payload, options?)
   * kind: 'chat' | 'pageAnalysis' | 'research' | 'factCheck' | 'faq'
   */
  export function buildPrompt(kind, payload = {}, options = {}) {
    switch (kind) {
      case 'chat':         return chatTemplate(payload, options);
      case 'pageAnalysis': return pageAnalysisTemplate(payload, options);
      case 'research':     return researchTemplate(payload, options);
      case 'factCheck':    return factCheckTemplate(payload, options);
      case 'faq':          return faqOnlyTemplate(payload, options);
      default:
        throw new Error(`Unknown prompt kind: ${kind}`);
    }
  }
  
  // (optional) named exports if you want direct access
  export const PromptBuilder = {
    chat: chatTemplate,
    pageAnalysis: pageAnalysisTemplate,
    research: researchTemplate,
    factCheck: factCheckTemplate,
    faq: faqOnlyTemplate,
  };  