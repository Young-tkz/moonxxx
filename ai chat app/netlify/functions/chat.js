/**
 * netlify/functions/chat.js
 * Serverless proxy that calls Google Gemini. Every line is commented.
 */

// Export a Netlify handler so Netlify knows how to run this function.
exports.handler = async function(event, context) { // main entry point
  // Only allow POST requests for this endpoint.
  if (event.httpMethod !== 'POST') { // guard method
    // Return a 405 Method Not Allowed if someone uses GET.
    return { statusCode: 405, body: 'Method Not Allowed' }; // minimal response
  }

  try { // wrap everything in try/catch to handle errors
    // Read your Gemini API key from Netlify environment variables.
    const API_KEY = process.env.GEMINI_API_KEY; // set this in Netlify dashboard (Site settings → Environment variables)
    // If there is no key, we cannot proceed.
    if (!API_KEY) { // missing key guard
      return { statusCode: 500, body: JSON.stringify({ error: 'Server missing GEMINI_API_KEY' }) }; // helpful error
    }

    // Parse the JSON body that came from the browser.
    const payload = JSON.parse(event.body || '{}'); // read model, messages, etc.
    // Extract the model name or use a safe default.
    const model = payload.model || 'gemini-1.5-flash'; // default fast model
    // Extract the messages array (system + user/assistant turns).
    const messages = Array.isArray(payload.messages) ? payload.messages : []; // ensure array

    // Build Gemini "contents" from our simpler messages format.
    // Gemini expects: [{role:'user'|'model', parts:[{text:'...'}]}]
    const contents = messages.map(m => ({ // convert each message
      role: m.role === 'assistant' ? 'model' : (m.role === 'system' ? 'user' : m.role), // map roles; we fold system into user
      parts: [{ text: String(m.content || '') }] // wrap text in parts array
    }));

    // Construct the API URL including your key as a query parameter.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${API_KEY}`; // Gemini endpoint

    // Create the request body following Gemini's REST spec.
    const body = JSON.stringify({ // stringify JSON payload
      contents, // our conversation
      generationConfig: { temperature: 0.7, topP: 0.9 }, // simple controls
      safetySettings: [] // use defaults; you can add policies here later
    });

    // Call the Gemini API with fetch from within the function.
    const resp = await fetch(url, { // send HTTP request
      method: 'POST', // POST to generateContent
      headers: { 'Content-Type': 'application/json' }, // JSON payload
      body // attach the request body
    });

    // If the status is not OK, read the text and return an error.
    if (!resp.ok) { // handle non-200
      const t = await resp.text(); // read error details
      return { statusCode: resp.status, body: JSON.stringify({ error: 'Gemini error', details: t }) }; // relay
    }

    // Read the JSON reply from Gemini.
    const json = await resp.json(); // parse response
    // Safely extract the assistant text from the nested structure.
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not produce a response.'; // fallback message

    // Return the assistant message to the browser as JSON.
    return { statusCode: 200, body: JSON.stringify({ message: text }) }; // minimal success
  } catch (err) { // catch any unexpected error
    // Send back a 500 with the error message for debugging.
    return { statusCode: 500, body: JSON.stringify({ error: 'Function crashed', details: err.message }) }; // crash report
  } // end try/catch
}; // end handler