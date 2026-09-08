import { runLegalAgent, type AiRequest } from '@/lib/ai-gateway';
import { env } from 'cloudflare:workers';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AiRequest>;
    if (!body.prompt?.trim()) return Response.json({ error: 'prompt is required' }, { status: 400 });
    if (!body.mode || !['consult', 'draft', 'review'].includes(body.mode)) return Response.json({ error: 'invalid mode' }, { status: 400 });
    const runtimeEnv = env as unknown as Record<string, string | undefined>;
    const result = await runLegalAgent({ prompt: body.prompt, mode: body.mode, matterId: body.matterId, model: body.model, sourceIds: body.sourceIds }, runtimeEnv);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid request';
    return Response.json({ error: message }, { status: 400 });
  }
}

