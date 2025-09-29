# netlify/functions/chat.js — line-by-line (for non‑technical readers)

**L001** `/**`

- Explanation: 
**L002** ` * netlify/functions/chat.js`

- Explanation: 
**L003** ` * Serverless proxy that calls Google Gemini. Every line is commented.`

- Explanation: 
**L004** ` */`

- Explanation: 
**L005** ` `

- Explanation: 
**L006** `// Export a Netlify handler so Netlify knows how to run this function.`

- Explanation: 
**L007** `exports.handler = async function(event, context) { // main entry point`

- Explanation: 
**L008** `  // Only allow POST requests for this endpoint.`

- Explanation: 
**L009** `  if (event.httpMethod !== 'POST') { // guard method`

- Explanation: 
**L010** `    // Return a 405 Method Not Allowed if someone uses GET.`

- Explanation: 
**L011** `    return { statusCode: 405, body: 'Method Not Allowed' }; // minimal response`

- Explanation: 
**L012** `  }`

- Explanation: 
**L013** ` `

- Explanation: 
**L014** `  try { // wrap everything in try/catch to handle errors`

- Explanation: 
**L015** `    // Read your Gemini API key from Netlify environment variables.`

- Explanation: 
**L016** `    const API_KEY = process.env.GEMINI_API_KEY; // set this in Netlify dashboard (Site settings → Environment variables)`

- Explanation: 
**L017** `    // If there is no key, we cannot proceed.`

- Explanation: 
**L018** `    if (!API_KEY) { // missing key guard`

- Explanation: 
**L019** `      return { statusCode: 500, body: JSON.stringify({ error: 'Server missing GEMINI_API_KEY' }) }; // helpful error`

- Explanation: 
**L020** `    }`

- Explanation: 
**L021** ` `

- Explanation: 
**L022** `    // Parse the JSON body that came from the browser.`

- Explanation: 
**L023** `    const payload = JSON.parse(event.body || '{}'); // read model, messages, etc.`

- Explanation: 
**L024** `    // Extract the model name or use a safe default.`

- Explanation: 
**L025** `    const model = payload.model || 'gemini-1.5-flash'; // default fast model`

- Explanation: 
**L026** `    // Extract the messages array (system + user/assistant turns).`

- Explanation: 
**L027** `    const messages = Array.isArray(payload.messages) ? payload.messages : []; // ensure array`

- Explanation: 
**L028** ` `

- Explanation: 
**L029** `    // Build Gemini "contents" from our simpler messages format.`

- Explanation: 
**L030** `    // Gemini expects: [{role:'user'|'model', parts:[{text:'...'}]}]`

- Explanation: 
**L031** `    const contents = messages.map(m => ({ // convert each message`

- Explanation: 
**L032** `      role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role), // map roles; we fold system into user`

- Explanation: 
**L033** `      parts: [{ text: String(m.content || '') }] // wrap text in parts array`

- Explanation: 
**L034** `    }));`

- Explanation: 
**L035** ` `

- Explanation: 
**L036** `    // Construct the API URL including your key as a query parameter.`

- Explanation: 
**L037** `    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${API_KEY}`; // Gemini endpoint`

- Explanation: 
**L038** ` `

- Explanation: 
**L039** `    // Create the request body following Gemini's REST spec.`

- Explanation: 
**L040** `    const body = JSON.stringify({ // stringify JSON payload`

- Explanation: 
**L041** `      contents, // our conversation`

- Explanation: 
**L042** `      generationConfig: { temperature: 0.7, topP: 0.9 }, // simple controls`

- Explanation: 
**L043** `      safetySettings: [] // use defaults; you can add policies here later`

- Explanation: 
**L044** `    });`

- Explanation: 
**L045** ` `

- Explanation: 
**L046** `    // Call the Gemini API with fetch from within the function.`

- Explanation: 
**L047** `    const resp = await fetch(url, { // send HTTP request`

- Explanation: 
**L048** `      method: 'POST', // POST to generateContent`

- Explanation: 
**L049** `      headers: { 'Content-Type': 'application/json' }, // JSON payload`

- Explanation: 
**L050** `      body // attach the request body`

- Explanation: 
**L051** `    });`

- Explanation: 
**L052** ` `

- Explanation: 
**L053** `    // If the status is not OK, read the text and return an error.`

- Explanation: 
**L054** `    if (!resp.ok) { // handle non-200`

- Explanation: 
**L055** `      const t = await resp.text(); // read error details`

- Explanation: 
**L056** `      return { statusCode: resp.status, body: JSON.stringify({ error: 'Gemini error', details: t }) }; // relay`

- Explanation: 
**L057** `    }`

- Explanation: 
**L058** ` `

- Explanation: 
**L059** `    // Read the JSON reply from Gemini.`

- Explanation: 
**L060** `    const json = await resp.json(); // parse response`

- Explanation: 
**L061** `    // Safely extract the assistant text from the nested structure.`

- Explanation: 
**L062** `    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not produce a response.'; // fallback message`

- Explanation: 
**L063** ` `

- Explanation: 
**L064** `    // Return the assistant message to the browser as JSON.`

- Explanation: 
**L065** `    return { statusCode: 200, body: JSON.stringify({ message: text }) }; // minimal success`

- Explanation: 
**L066** `  } catch (err) { // catch any unexpected error`

- Explanation: 
**L067** `    // Send back a 500 with the error message for debugging.`

- Explanation: 
**L068** `    return { statusCode: 500, body: JSON.stringify({ error: 'Function crashed', details: err.message }) }; // crash report`

- Explanation: 
**L069** `  } // end try/catch`

- Explanation: 
**L070** `}; // end handler`

- Explanation: 