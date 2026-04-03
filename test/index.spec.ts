import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

describe("ELIZA API", () => {
	it("responds with health check on GET /", async () => {
		const response = await SELF.fetch("https://example.com/health");
		expect(response.status).toBe(200);
		const data = await response.json() as any;
		expect(data.status).toBe("ok");
		expect(data.engine).toBe("elizabot");
	});

	it("handles /v1/chat/completions POST request", async () => {
		const payload = {
			model: "eliza",
			messages: [
				{ role: "user", content: "Hello, who are you?" }
			]
		};

		const response = await SELF.fetch("https://example.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		expect(response.status).toBe(200);
		const data = await response.json() as any;
		
		expect(data.id).toBeDefined();
		expect(data.object).toBe("chat.completion");
		expect(data.choices[0].message.role).toBe("assistant");
		expect(typeof data.choices[0].message.content).toBe("string");
		expect(data.usage).toBeDefined();
	});

	it("replays multi-turn history correctly (stateless test)", async () => {
		const payload = {
			model: "eliza",
			messages: [
				{ role: "user", content: "I am sad." },
				{ role: "assistant", content: "I am sorry to hear you are sad." },
				{ role: "user", content: "Can you help me?" }
			]
		};

		const response = await SELF.fetch("https://example.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		expect(response.status).toBe(200);
		const data = await response.json() as any;
		expect(data.choices[0].message.content).toBeDefined();
	});

	it("returns 400 for empty messages", async () => {
		const payload = {
			model: "eliza",
			messages: []
		};

		const response = await SELF.fetch("https://example.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		expect(response.status).toBe(400);
	});
});
