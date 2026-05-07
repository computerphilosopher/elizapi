import ElizaBot from 'elizabot';

export interface Env {
	ASSETS: Fetcher;
}

interface OpenAIChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

interface OpenAIChatRequest {
	model: string;
	messages: OpenAIChatMessage[];
	stream?: boolean;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Basic health check
		if (request.method === 'GET' && url.pathname === '/health') {
			return Response.json({ status: 'ok', name: 'elizapi', engine: 'elizabot' }, { headers: corsHeaders });
		}

		// Only handle /v1/chat/completions
		if (url.pathname !== '/v1/chat/completions') {
			return env.ASSETS.fetch(request);
		}

		if (request.method !== 'POST') {
			return new Response('Not Found', { status: 404, headers: corsHeaders });
		}

		try {
			const body: OpenAIChatRequest = await request.json();
			const messages = body.messages || [];

			if (messages.length === 0) {
				return Response.json({ error: 'No messages provided' }, { status: 400, headers: corsHeaders });
			}

			// Initialize ELIZA
			// @ts-ignore (elizabot doesn't have types)
			const eliza = new ElizaBot();
			
			// Simple stateless implementation:
			// We replay all previous user messages to rebuild ELIZA's internal state (memory, keywords hit).
			// This makes it more "ELIZA-like" than just transforming the last message.
			let lastReply = '';
			for (const msg of messages) {
				if (msg.role === 'user') {
					lastReply = eliza.transform(msg.content);
				}
			}

			if (!lastReply) {
				// Fallback if no user messages were found
				lastReply = eliza.getInitial();
			}

			const responseBody = {
				id: `chatcmpl-${crypto.randomUUID()}`,
				object: 'chat.completion',
				created: Math.floor(Date.now() / 1000),
				model: body.model || 'elizabot',
				choices: [
					{
						index: 0,
						message: {
							role: 'assistant',
							content: lastReply,
						},
						finish_reason: 'stop',
					},
				],
				usage: {
					// Dummy token counting
					prompt_tokens: messages.reduce((acc, m) => acc + m.content.length, 0),
					completion_tokens: lastReply.length,
					total_tokens: messages.reduce((acc, m) => acc + m.content.length, 0) + lastReply.length,
				},
			};

			return Response.json(responseBody);
		} catch (e) {
			console.error(e);
			return Response.json({ error: 'Internal Server Error', details: (e as Error).message }, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
