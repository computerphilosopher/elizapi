import ElizaBot from 'elizabot';

export interface Env {
	// If you need bindings, add them here
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

		// Basic health check or greeting for GET /
		if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
			return Response.json({ status: 'ok', name: 'elizapi', engine: 'elizabot' });
		}

		// Only handle /v1/chat/completions
		if (request.method !== 'POST' || url.pathname !== '/v1/chat/completions') {
			return new Response('Not Found', { status: 404 });
		}

		try {
			const body: OpenAIChatRequest = await request.json();
			const messages = body.messages || [];

			if (messages.length === 0) {
				return Response.json({ error: 'No messages provided' }, { status: 400 });
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
