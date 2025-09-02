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

// -------------------------- research depth configs (MUCH stronger differences) --------------------------
// These configs drive how the research template renders sections and constraints.
// Quick = fast scan; Comprehensive = structured review; Expert = deep audit-level brief.

const ResearchDepth = {
  quick: {
    label: 'quick',
    description: 'Fast overview for immediate context; minimal sources and no tables.',
    maxSources: 4,                        // Very small source budget
    counts: {                             // Tight, short output
      overviewSentences: '1–2',
      keyFindingsBullets: '3–5',
      nuancesBullets: '2–3',
      takeawaysBullets: '3–5',
    },
    extras: {
      addComparisonTable: false,
      addOpenQuestions: false,
      addMethods: false,
      addBenchmarks: false,
      addContradictions: false,
      addImplementationPlan: false,
      addAppendix: false,
    },
    sourceRules: [
      'Favor recency (≤ 18 months) and official/primary docs when possible.',
      'Avoid shaky blogs; inline markdown links only; no numeric citation system.',
      'If a claim is uncertain, label it clearly.',
    ],
  },

  comprehensive: {
    label: 'comprehensive',
    description: 'Balanced review with structure and a small comparison table.',
    maxSources: 10,
    counts: {
      overviewSentences: '2–3',
      keyFindingsBullets: '6–10',
      nuancesBullets: '4–6',
      takeawaysBullets: '5–8',
    },
    extras: {
      addComparisonTable: true,           // Add a small table (3–5 rows, 3–5 cols)
      addOpenQuestions: true,             // Add "## Open Questions" (3–5 bullets)
      addMethods: false,
      addBenchmarks: false,
      addContradictions: true,            // Add "## Conflicting Evidence" (2–4 bullets)
      addImplementationPlan: false,
      addAppendix: false,
    },
    sourceRules: [
      'Mix reputable media, vendor/official docs, and 2–3 peer-reviewed/standards items.',
      'Ensure at least 50% of sources are ≤ 24 months old.',
      'Use inline markdown links; include year and org/author in Sources.',
    ],
  },

  expert: {
    label: 'expert',
    description: 'Deep, audit-level research with methodology, grading, benchmarks, and appendix.',
    maxSources: 18,                       // Large source budget
    counts: {
      overviewSentences: '3–4',
      keyFindingsBullets: '10–15',
      nuancesBullets: '6–10',
      takeawaysBullets: '6–10',
    },
    extras: {
      addComparisonTable: true,           // Larger/denser table allowed
      addOpenQuestions: true,
      addMethods: true,                   // Add "## Methods (Search & Inclusion Criteria)"
      addBenchmarks: true,                // Add "## Benchmarks & Metrics"
      addContradictions: true,
      addImplementationPlan: true,        // Add "## Implementation Plan (Step-by-Step)"
      addAppendix: true,                  // Add "## Appendix: Datasets, Repos & Further Reading"
    },
    sourceRules: [
      'Use a numeric citation style like [1], [2] inline; map to a numbered Sources list.',
      '≥ 6 peer-reviewed or official standards (RFC/ISO/NIST/etc.), ≥ 2 datasets or repos.',
      '≥ 60% of sources must be ≤ 24 months old; clearly mark publication year.',
      'Grade evidence: **Strong / Moderate / Weak** and call out contradictions explicitly.',
    ],
  },
};

// -------------------------- helpers --------------------------

const joinBullets = (arr) => (arr || []).filter(Boolean).map(s => `- ${s}`).join('\n');

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

// -------------------------- NEW research template with strong depth divergence --------------------------

function researchTemplate({ topic, depth = 'comprehensive' }, opts = {}) {
  const cfg = ResearchDepth[depth] || ResearchDepth.comprehensive;

  // Core sections exist at all depths so downstream rendering stays stable.
  // Depth toggles add/remove heavier sections and change strictness & counts.
  const coreStructure = [
    'Start with `## Overview` (exactly ' + cfg.counts.overviewSentences + ' sentences).',
    '`## Key Findings` — ' + cfg.counts.keyFindingsBullets + ' bullet points.',
    '`## Nuances & Trade-offs` — ' + cfg.counts.nuancesBullets + ' bullet points.',
    '`## Practical Takeaways` — ' + cfg.counts.takeawaysBullets + ' bullet points.',
  ];

  const extrasStructure = [];
  if (cfg.extras.addComparisonTable) {
    extrasStructure.push('`## Comparison Table` — compact table (compare 3–5 items × 3–5 criteria).');
  }
  if (cfg.extras.addOpenQuestions) {
    extrasStructure.push('`## Open Questions` — 3–5 bullets of what remains uncertain.');
  }
  if (cfg.extras.addMethods) {
    extrasStructure.push('`## Methods (Search & Inclusion Criteria)` — where you searched, date range, selection filters.');
  }
  if (cfg.extras.addBenchmarks) {
    extrasStructure.push('`## Benchmarks & Metrics` — datasets, metrics, SOTA numbers if applicable.');
  }
  if (cfg.extras.addContradictions) {
    extrasStructure.push('`## Conflicting Evidence` — list key disagreements and why they differ.');
  }
  if (cfg.extras.addImplementationPlan) {
    extrasStructure.push('`## Implementation Plan (Step-by-Step)` — actionable steps, pitfalls, and checks.');
  }
  if (cfg.extras.addAppendix) {
    extrasStructure.push('`## Appendix: Datasets, Repos & Further Reading` — grouped bullets with 1-line notes.');
  }

  const sourcesBlock = [
    '`## Sources` — up to ' + cfg.maxSources + ' items.',
    ...(depth === 'expert'
      ? [
          'Use numeric inline citations like [1], [2]; they must map to this numbered list.',
          'Each source: title, author/org, year, and a markdown link. Add a 1-line rationale.',
          'Include: ≥ 6 peer-reviewed/standards, ≥ 2 datasets or code repos, ≥ 60% from the last 24 months.',
        ]
      : [
          'Each source: title, author/org, year, and a markdown link.',
          'Favor recent and reputable sources; avoid low-credibility blogs.',
        ]),
  ];

  return [
    sharedDirectives(opts),
    '',
    '### Task',
    `Research **${topic}** and present findings in Markdown.`,
    '',
    '### Depth',
    `- ${cfg.label} — ${cfg.description} (aim for up to ${cfg.maxSources} high-quality sources)`,
    '',
    '### Output Structure (Markdown)',
    joinBullets([
      ...coreStructure,
      ...extrasStructure,
      ...sourcesBlock,
      'No preface (e.g., “Okay, here’s a summary”) and no outro.',
    ]),
    '',
    '### Requirements',
    joinBullets([
      ...(cfg.sourceRules || []),
      ...(depth === 'expert'
        ? [
            'Grade evidence on each major claim: **Strong / Moderate / Weak** (brief reason).',
            'Call out recency explicitly when relevant (e.g., “2024 study” or “as of 2025”).',
          ]
        : []),
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