# Eliza Retro CRT Chat Interface Prompt for Lovable

Copy and paste the following prompt into [Lovable](https://lovable.dev/) or [v0.dev](https://v0.dev/) to generate the frontend for your Eliza API.

---

```text
Create a web-based chat interface for "ELIZA", the classic 1966 psychotherapist chatbot.

# Design Concept (Authentic 1970s CRT Terminal)
- **The UI must look like an authentic, vintage CRT monitor.** This is the most important design requirement.
- **Background & Color:** Deep black background `#000000` with bright phosphor green `#39ff14` or amber text.
- **Typography:** Use a strictly monospace font (e.g., 'Courier New', 'VT323', or standard monospace).
- **CRT Effects (CRITICAL):**
  1. Add a subtle, semi-transparent CSS scanline overlay pattern across the entire screen.
  2. Apply a glowing effect to the text using `text-shadow` (e.g., `0 0 5px #39ff14, 0 0 10px #39ff14`).
  3. Slightly curve the edges of the main container using `border-radius` to mimic the bulge of an old glass cathode-ray tube screen.
  4. Add a very subtle vignette (darkened corners) using a radial gradient background.
- **Layout:** A clean chat window taking up the center of the screen, styled like a terminal box. 
- **Header:** Title "ELIZA (1966)" and subtitle "Powered by ElizAPI".
- **Interaction:** Hide standard scrollbars if possible, keeping the terminal aesthetic clean.

# Functional Requirements
- **Chat Log:** Display the conversation history. User messages should align to the right, Eliza's responses to the left. Prefix Eliza's messages with `> ELIZA:` and user messages with `> YOU:`.
- **Input Area:** A text input field at the bottom with a blinking block cursor `█`. Allow pressing Enter to send.
- **Loading State:** Show a retro "Processing..." indicator with a blinking cursor while waiting for the API response.

# API Integration & State Management (CRITICAL)
- You must maintain the full conversation history in a state variable (array of objects with `role: 'user' | 'assistant'` and `content: string`).
- **Endpoint:** POST `https://elizapi.erlk0nig.workers.dev/v1/chat/completions`
- **Headers:** `{"Content-Type": "application/json"}`
- **Request Body Format (OpenAI Compatible):**
  When the user sends a message, append it to the history state, and send the ENTIRE updated history array to the API.
  ```json
  {
    "model": "elizabot",
    "messages": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "How do you do. Please tell me your problem." },
      { "role": "user", "content": "I am feeling sad today." } 
      // MUST INCLUDE ALL PREVIOUS TURNS
    ]
  }
  ```
- **Handling Response:** Extract the text from `response.choices[0].message.content`, append it to the history state as `role: "assistant"`, and display it in the chat log.

# Initial State
- The chat should start with an initial greeting from Eliza already in the chat log (do not call the API for this first message).
- Initial message: "How do you do. Please tell me your problem."
```
