// =========================
// moon.ai — app.js (MVP)
// Every line is commented in plain English.
// =========================

// Grab the chat container where messages will appear.
const chatSurface = document.getElementById('chatSurface'); // we will append message bubbles here

// Get the form that holds the input and send button.
const composer = document.getElementById('composer'); // we listen for "submit" on this form

// Reach into the textarea where the user types.
const inputEl = document.getElementById('input'); // we read the message text from here

// Find the send button in case we want to enable/disable it.
const sendBtn = document.getElementById('sendBtn'); // we disable it while sending

// Find the model dropdown so the user can switch models.
const modelSelect = document.getElementById('modelSelect'); // choices: gemini-1.5-flash, gemini-1.5-pro

// Keep a simple in-memory state for the current conversation.
let thread = { id: null, model: modelSelect.value, messages: [] }; // this holds id, chosen model, and the message list

// Define a storage key so we always save/load from the same place in localStorage.
const STORE_KEY = 'moonai'; // one key to store the whole app state

// Create a helper to load saved data from localStorage.
function loadState() { // called on startup to restore past chat
  // Try to read JSON text from localStorage.
  const raw = localStorage.getItem(STORE_KEY); // might be null on first run
  // If we have saved data, parse it, otherwise make a new default object.
  const state = raw ? JSON.parse(raw) : { currentThreadId: null, threads: {} }; // create a shape for our storage
  // If there is a current thread id, use that; otherwise create a new one.
  if (state.currentThreadId && state.threads[state.currentThreadId]) { // check if a valid thread exists
    thread = state.threads[state.currentThreadId]; // restore the thread from storage
  } else {
    thread = { id: crypto.randomUUID(), model: modelSelect.value, messages: [] }; // make a fresh thread
    state.currentThreadId = thread.id; // remember it as current
    state.threads[thread.id] = thread; // store it in the map
    localStorage.setItem(STORE_KEY, JSON.stringify(state)); // save back to storage
  }
  // Also reflect the model in the dropdown UI.
  modelSelect.value = thread.model; // keep UI in sync with data
  // Finally, paint any existing messages to the screen.
  renderAll(); // show the past messages (if any)
} // end loadState

// Create a helper to save the whole app state back to localStorage.
function saveState() { // called whenever messages or model change
  // Read current saved object (or build a blank one).
  const raw = localStorage.getItem(STORE_KEY); // read existing storage
  const state = raw ? JSON.parse(raw) : { currentThreadId: thread.id, threads: {} }; // fallback shape
  // Ensure current thread id is set.
  state.currentThreadId = thread.id; // mark our thread as current
  // Put our thread into the threads map.
  state.threads[thread.id] = thread; // overwrite or insert the thread
  // Convert back to text and save.
  localStorage.setItem(STORE_KEY, JSON.stringify(state)); // persist to browser
} // end saveState

// Make a small helper that creates a message bubble DOM node.
function bubble(role, text, pending = false) { // role is 'user' or 'assistant', pending shows typing dots
  // Create a wrapper element for a single message.
  const item = document.createElement('div'); // this will hold the bubble
  // Choose left/right alignment based on who is speaking.
  item.className = role === 'user' ? 'flex justify-start' : 'flex justify-end'; // user on left, assistant on right
  // Create the bubble shape itself.
  const box = document.createElement('div'); // inner bubble box
  // Use colors based on who is speaking.
  box.className = role === 'user'
    ? 'max-w-[80%] rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3'
    : 'max-w-[80%] rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-300/30 px-4 py-3'; // subtle different styles
  // If this is a pending bubble, show three jumping dots.
  box.innerHTML = pending ? '<span class="inline-flex gap-1"><span class="animate-bounce">•</span><span class="animate-bounce [animation-delay:120ms]">•</span><span class="animate-bounce [animation-delay:240ms]">•</span></span>' : text; // typing or final text
  // Put the bubble into the wrapper.
  item.appendChild(box); // mount bubble into the item
  // Return the finished DOM node.
  return item; // caller will append to chatSurface
} // end bubble

// Render all messages currently in the thread to the chat surface.
function renderAll() { // clears chatSurface then appends each message bubble
  // Clear whatever is currently on the screen.
  chatSurface.innerHTML = ''; // start fresh
  // If there are no messages yet, keep the hero/empty section visible.
  document.getElementById('emptyState').style.display = thread.messages.length ? 'none' : 'block'; // toggle empty state
  // Loop through every message we have saved.
  for (const m of thread.messages) { // go in order
    // Create a bubble for each message.
    const node = bubble(m.role, m.content); // build bubble from data
    // Add it to the chat area.
    chatSurface.appendChild(node); // show on screen
  }
  // After rendering, scroll to the bottom.
  chatSurface.scrollTop = chatSurface.scrollHeight; // keep newest messages visible
} // end renderAll

// When the model dropdown changes, update the thread and save.
modelSelect.addEventListener('change', () => { // listen for user choosing a model
  thread.model = modelSelect.value; // record the new model choice
  saveState(); // persist the change
}); // end model change listener

// Listen for the form submit (clicking send or pressing Enter).
composer.addEventListener('submit', async (e) => { // main send handler
  // Stop the form from actually reloading the page.
  e.preventDefault(); // single page behavior
  // Read and trim the input text.
  const text = inputEl.value.trim(); // get user text
  // If there is nothing to send, do nothing.
  if (!text) return; // ignore empty messages

  // Build a message object for the user turn.
  const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() }; // minimal fields
  // Push it into our thread memory.
  thread.messages.push(userMsg); // add to conversation
  // Save to localStorage so it survives refresh.
  saveState(); // persist after user sends
  // Repaint the screen including the new user message.
  renderAll(); // show latest state
  // Clear the input box for the next message.
  inputEl.value = ''; // reset composer

  // Create and show a temporary assistant bubble that looks like typing.
  const pendingNode = bubble('assistant', '', true); // pending=true shows animated dots
  // Put that bubble on the screen right away.
  chatSurface.appendChild(pendingNode); // visual feedback while waiting
  // Scroll so the user sees the typing indicator.
  chatSurface.scrollTop = chatSurface.scrollHeight; // keep it in view
  // Disable the send button so we don't double-send.
  sendBtn.disabled = true; // block extra clicks

  try { // start of network try/catch
    // Prepare the payload we send to our Netlify function.
    const payload = { // minimal fields the backend expects
      threadId: thread.id, // lets the server know which thread (for future use)
      model: thread.model, // gemini-1.5-flash or gemini-1.5-pro
      messages: [ // complete conversation so far
        { role: 'system', content: 'You are moon.ai — The Digital You. Be friendly, concise, and helpful. If unsure, say so briefly.' },
        ...thread.messages.map(m => ({ role: m.role, content: m.content })) // convert local messages
      ]
    }; // end payload

    // Call our serverless endpoint that hides the API key.
    const res = await fetch('/api/chat', { // Netlify function route we will deploy
      method: 'POST', // sending data
      headers: { 'Content-Type': 'application/json' }, // tell server we send JSON
      body: JSON.stringify(payload) // attach the payload text
    }); // end fetch

    // If the HTTP status is not OK, throw an error to the catch block.
    if (!res.ok) throw new Error('Network error ' + res.status); // simple error guard
    // Parse the JSON reply from the server.
    const data = await res.json(); // read { message: '...', usage: {...} }
    // Make a message object for the assistant's text.
    const botMsg = { id: crypto.randomUUID(), role: 'assistant', content: data.message, ts: Date.now() }; // assistant turn
    // Add the assistant message to the thread.
    thread.messages.push(botMsg); // store reply
    // Save the updated thread.
    saveState(); // persist after assistant replies
    // Replace the pending bubble with the final assistant bubble.
    pendingNode.replaceWith(bubble('assistant', botMsg.content)); // swap typing with content
    // Make sure we are scrolled to the latest message.
    chatSurface.scrollTop = chatSurface.scrollHeight; // show newest
  } catch (err) { // handle any error
    // Replace the pending bubble with a soft error bubble.
    pendingNode.replaceWith(bubble('assistant', '⚠️ Sorry, I had trouble replying. Please try again.')); // friendly failure message
  } finally { // always run after try/catch
    // Re-enable the send button so the user can send again.
    sendBtn.disabled = false; // restore button
  } // end try/catch/finally
}); // end submit handler

// Run once on page load to restore state and UI.
loadState(); // initialize the app