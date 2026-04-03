# ElizAPI
## ELIZA Behind an OpenAI-Compatible API

Bringing the world's first chatbot (1966) to the modern LLM ecosystem.

### Overview
ElizAPI wraps the classic ELIZA chatbot algorithm in a modern, OpenAI-compatible `/v1/chat/completions` REST API. This allows you to drop ELIZA into any modern LLM tooling, framework (like LangChain or LlamaIndex), or UI that expects an OpenAI endpoint.

### Tech Stack
- **Environment:** Cloudflare Workers (Edge Serverless)
- **Language:** TypeScript
- **Engine:** `elizabot` (Node.js port of the original ELIZA algorithm)
- **Protocol:** REST API (OpenAI API compatibility layer)

### Usage Example

To maintain ELIZA's "memory" (e.g., *"Earlier you mentioned..."*), you must send the **entire conversation history** in the `messages` array for every request. Since the server is stateless, it replays previous messages to rebuild ELIZA's internal state.

#### cURL
```bash
curl -X POST https://your-worker-url.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "elizabot",
    "messages": [
      {"role": "user", "content": "I am feeling stressed."},
      {"role": "assistant", "content": "Why do you say you are feeling stressed?"},
      {"role": "user", "content": "Because of my work."}
    ]
  }'
```

#### Node.js (OpenAI SDK)
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'not-needed',
  baseURL: 'https://your-worker-url.workers.dev/v1',
});

// To keep ELIZA's memory, always include previous messages
const response = await openai.chat.completions.create({
  model: 'elizabot',
  messages: [
    { role: 'user', content: 'I am feeling stressed.' },
    { role: 'assistant', content: 'Why do you say you are feeling stressed?' },
    { role: 'user', content: 'Because of my work.' }
  ],
});

console.log(response.choices[0].message.content);
```

#### Python (OpenAI SDK)
```python
from openai import OpenAI

client = OpenAI(
    api_key="not-needed",
    base_url="https://your-worker-url.workers.dev/v1"
)

# To keep ELIZA's memory, always include previous messages
response = client.chat.completions.create(
    model="elizabot",
    messages=[
        {"role": "user", "content": "I am feeling stressed."},
        {"role": "assistant", "content": "Why do you say you are feeling stressed?"},
        {"role": "user", "content": "Because of my work."}
    ]
)

print(response.choices[0].message.content)
```

### Deployment

If you want to run your own instance of ElizAPI on your Cloudflare account:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/computerphilosopher/elizapi.git
   cd elizapi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

### License
MIT
