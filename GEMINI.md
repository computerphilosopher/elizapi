# ELIZA API Project Context

## Project Goal
The primary objective of this project is to create an API that makes the original ELIZA chatbot respond to an OpenAI-compatible API interface. 

## Tech Stack
- **Environment:** Cloudflare Workers

## Libraries
- **Chatbot Logic:** `elizabot` (npm package: https://www.npmjs.com/package/elizabot)

## License
- MIT License

## State Management (Conversation Memory)
- **Stateless Server:** The Cloudflare worker does not store conversation state.
- **Client-Side Storage:** Conversation memory is provided as JSON in every incoming request (it is assumed that the client stores this, e.g., in the browser's local storage).