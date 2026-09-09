export type AiRequest = {
  prompt: string;
  matterId?: string;
  mode: 'consult' | 'draft' | 'review';
  model?: string;
  sourceIds?: string[];
};

export type AiResponse = {
  answer: string;
  model: string;
  citations: Array<{ sourceId: string; label: string; locator?: string; url?: string; kind?: 'official' | 'matter' | 'firm' | 'web' }>;
  requiresReview: true;
  live: boolean;
  intent?: 'public_lookup' | 'legal_research' | 'draft' | 'review' | 'matter_consult';
  knowledgeUsed?: string[];
};

type KnowledgeSource = { sourceId: string; label: string; locator?: string; url?: string; kind: 'official' | 'matter' | 'firm' | 'web'; excerpt: string };

const publicSources: KnowledgeSource[] = [
  { sourceId: 'sec-edgar-search', label: 'SEC EDGAR Company Search', url: 'https://www.sec.gov/edgar/search/', kind: 'official', excerpt: 'Use the SEC official EDGAR search for company names, tickers, CIKs and filings.' },
  { sourceId: 'sec-api', label: 'SEC EDGAR APIs', url: 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces', kind: 'official', excerpt: 'SEC submissions and XBRL data are available through the official data.sec.gov APIs.' },
  { sourceId: 'govinfo', label: 'GovInfo · US Code and CFR', url: 'https://www.govinfo.gov/', kind: 'official', excerpt: 'Official US government publications, Federal Register, US Code and CFR materials.' },
  { sourceId: 'courtlistener', label: 'CourtListener · US opinions', url: 'https://www.courtlistener.com/', kind: 'official', excerpt: 'Public legal research source for many federal and state court opinions.' },
  { sourceId: 'hamilton-firm-playbook', label: 'Hamilton Litigation Playbook', locator: 'v2.4', kind: 'firm', excerpt: 'Internal workflow guidance. Demo source only until the firm uploads the approved version.' },
];

function classifyIntent(prompt: string, mode: AiRequest['mode']): AiResponse['intent'] {
  const value = prompt.toLowerCase();
  if (/(sec|edgar|cik|10-k|10-q|8-k|20-f|f-1|s-1).*(链接|网址|link|url|filing|申报)|链接.*(sec|edgar)|网址.*(sec|edgar)/i.test(value)) return 'public_lookup';
  if (mode === 'draft') return 'draft';
  if (mode === 'review') return 'review';
  if (/(法规|判例|案例|法条|regulation|statute|case law|precedent|court)/i.test(value)) return 'legal_research';
  return 'matter_consult';
}

function relevantSources(prompt: string, mode: AiRequest['mode']): KnowledgeSource[] {
  const intent = classifyIntent(prompt, mode);
  if (intent === 'public_lookup') return publicSources.filter(source => source.sourceId === 'sec-edgar-search' || source.sourceId === 'sec-api');
  if (intent === 'legal_research') return publicSources.filter(source => ['govinfo', 'courtlistener', 'sec-api'].includes(source.sourceId));
  return publicSources.filter(source => source.kind === 'firm' || source.kind === 'matter');
}

function publicCitation(source: KnowledgeSource): Omit<KnowledgeSource, 'excerpt'> {
  const { excerpt: _excerpt, ...citation } = source;
  return citation;
}

function deterministicPublicLookup(prompt: string): AiResponse | null {
  const value = prompt.trim();
  if (!/(sec|edgar|cik|10-k|10-q|8-k|20-f|f-1|s-1)/i.test(value) || !/(链接|网址|link|url|filing|申报)/i.test(value)) return null;
  const company = value.replace(/.*?(?:公司|company|for|关于)\s*/i, '').match(/[A-Z][A-Z0-9.& -]{1,30}/)?.[0]?.trim() || value.match(/[A-Z][A-Z0-9.&-]{1,20}/)?.[0] || 'company';
  const searchUrl = `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(company)}`;
  return {
    model: 'Hamilton Public Source Resolver',
    answer: `SEC 官方检索链接：${searchUrl}\n\n查询对象：${company}\n说明：这是 SEC EDGAR 官方检索入口。请在页面中进一步确认公司名称、CIK 和具体申报文件。`,
    citations: [
      { sourceId: 'sec-edgar-search', label: 'SEC EDGAR Company Search', url: searchUrl, kind: 'official' },
      { sourceId: 'sec-api', label: 'SEC EDGAR APIs', url: 'https://www.sec.gov/search-filings/edgar-application-programming-interfaces', kind: 'official' },
    ],
    requiresReview: true,
    live: true,
    intent: 'public_lookup',
    knowledgeUsed: ['SEC EDGAR official source resolver'],
  };
}

/**
 * Stable internal contract for OpenAI-compatible, Kimi and Qwen connectors.
 * Provider credentials stay server-side; the UI never receives API keys.
 */
export async function runLegalAgent(request: AiRequest, runtimeEnv?: Record<string, string | undefined>): Promise<AiResponse> {
  const model = request.model ?? 'qwen3.7-plus';
  const apiKey = runtimeEnv?.DASHSCOPE_API_KEY?.trim();
  const baseUrl = (runtimeEnv?.DASHSCOPE_BASE_URL ?? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '');
  const demoMode = runtimeEnv?.AI_MODE === 'demo';
  const intent = classifyIntent(request.prompt, request.mode);
  const sources = relevantSources(request.prompt, request.mode);
  const deterministic = deterministicPublicLookup(request.prompt);
  if (deterministic) return deterministic;

  const context = sources.map(source => `[${source.label}]${source.url ? ` ${source.url}` : ''}\n${source.excerpt}`).join('\n\n');

  if (!demoMode && apiKey && (model.includes('qwen') || model.includes('Qwen'))) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.7-plus',
        temperature: 0.1,
        messages: [
          { role: 'system', content: `You are Hamilton Legal Agent. Intent: ${intent}. Answer the exact question first and keep it concise. Never invent a URL, case, statute, quote, date, or citation. Use only the supplied knowledge context for source claims; if it is insufficient, say what is missing. For a simple lookup, return the answer or official link first and omit generic legal boilerplate. For legal analysis, distinguish facts, assumptions, and recommendations, cite sources in [brackets], and state that a licensed lawyer must review before external use.\n\nKnowledge context:\n${context}` },
          { role: 'user', content: request.prompt },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      let reason = detail;
      try {
        const parsed = JSON.parse(detail) as { code?: string; message?: string; error?: string };
        const candidate = parsed.message ?? parsed.error ?? parsed.code ?? detail;
        reason = typeof candidate === 'string' ? candidate : JSON.stringify(candidate);
      } catch {
        // Keep the raw provider response when it is not JSON.
      }
      const safeReason = String(reason ?? '');
      const diagnosticHost = (() => {
        try {
          return new URL(baseUrl).host;
        } catch {
          return 'invalid-base-url';
        }
      })();
      throw new Error(
        `DashScope request failed: ${response.status} [host=${diagnosticHost}; key=${apiKey.slice(0, 6)}…; length=${apiKey.length}]${safeReason ? ` — ${safeReason.slice(0, 240)}` : ''}`,
      );
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { model: 'qwen3.7-plus', answer: data.choices?.[0]?.message?.content ?? '模型未返回内容。', citations: sources.map(publicCitation), requiresReview: true, live: true, intent, knowledgeUsed: sources.map(source => source.label) };
  }

  return {
    model,
    answer: `演示模式：已收到你在「${request.matterId ?? '当前 Matter'}」中的${request.mode}请求：\n\n“${request.prompt}”\n\n当前未调用真实模型或知识库检索，因此不会生成正式法律意见。接入有效模型后，系统将基于 Matter 文件与律所知识库进行分析，并返回可追溯的来源与律师复核提示。`,
    citations: sources.map(publicCitation),
    requiresReview: true,
    live: false,
    intent,
    knowledgeUsed: sources.map(source => source.label),
  };
}

