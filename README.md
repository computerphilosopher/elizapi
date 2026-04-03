# ELIZA OpenAI-compatible API

This project is a Cloudflare Worker providing an OpenAI-compatible API for the classic ELIZA chatbot.

## Getting Started

1.  Install dependencies: `npm install`
2.  Run locally: `npx wrangler dev`
3.  Test with `curl`:

```bash
curl -X POST http://localhost:8787/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
  "model": "elizabot",
  "messages": [
    {"role": "user", "content": "Hello, I am feeling a bit stressed."}
  ]
}'
```

## Features

- **OpenAI Compatible**: Matches the Chat Completions API format.
- **Stateless History**: Send sequential messages with previous context, and the API will replay it to maintain ELIZA's internal state.
- **Classic ELIZA**: Powered by `elizabot`.

## License

MIT
