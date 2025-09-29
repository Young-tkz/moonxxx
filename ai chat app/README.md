# moon.ai — MVP (Netlify)

## Deploy
1. Create a new Netlify site from this folder.
2. In **Site settings → Environment variables**, add:
   - `GEMINI_API_KEY` = your Google Generative Language API key
3. Add a Netlify function:
   - File: `netlify/functions/chat.js` (already included here)
4. Make sure your frontend calls `/api/chat` (already done).

## Local dev
- You can use the Netlify CLI to test functions locally:
  ```bash
  npm i -g netlify functions-cli
  netlify functions dev
  ```

## Files
- `index.html` — UI with Tailwind
- `app.js` — chat logic (every line commented)
- `netlify/functions/chat.js` — serverless proxy (every line commented)
- `docs/app-explained.md` — line-by-line explanation of app.js
- `docs/chat-explained.md` — line-by-line explanation of chat.js

Generated: 2025-09-28T19:46:48.490030Z