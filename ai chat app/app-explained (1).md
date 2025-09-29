# app.js — line-by-line (for non‑technical readers)

**L001** `// =========================`

- Explanation: 
**L002** `// moon.ai — app.js (MVP)`

- Explanation: 
**L003** `// Every line is commented in plain English.`

- Explanation: 
**L004** `// =========================`

- Explanation: 
**L005** ` `

- Explanation: 
**L006** `// Grab the chat container where messages will appear.`

- Explanation: 
**L007** `const chatSurface = document.getElementById('chatSurface'); // we will append message bubbles here`

- Explanation: 
**L008** ` `

- Explanation: 
**L009** `// Get the form that holds the input and send button.`

- Explanation: 
**L010** `const composer = document.getElementById('composer'); // we listen for "submit" on this form`

- Explanation: 
**L011** ` `

- Explanation: 
**L012** `// Reach into the textarea where the user types.`

- Explanation: 
**L013** `const inputEl = document.getElementById('input'); // we read the message text from here`

- Explanation: 
**L014** ` `

- Explanation: 
**L015** `// Find the send button in case we want to enable/disable it.`

- Explanation: 
**L016** `const sendBtn = document.getElementById('sendBtn'); // we disable it while sending`

- Explanation: 
**L017** ` `

- Explanation: 
**L018** `// Find the model dropdown so the user can switch models.`

- Explanation: 
**L019** `const modelSelect = document.getElementById('modelSelect'); // choices: gemini-1.5-flash, gemini-1.5-pro`

- Explanation: 
**L020** ` `

- Explanation: 
**L021** `// Keep a simple in-memory state for the current conversation.`

- Explanation: 
**L022** `let thread = { id: null, model: modelSelect.value, messages: [] }; // this holds id, chosen model, and the message list`

- Explanation: 
**L023** ` `

- Explanation: 
**L024** `// Define a storage key so we always save/load from the same place in localStorage.`

- Explanation: 
**L025** `const STORE_KEY = 'moonai'; // one key to store the whole app state`

- Explanation: 
**L026** ` `

- Explanation: 
**L027** `// Create a helper to load saved data from localStorage.`

- Explanation: 
**L028** `function loadState() { // called on startup to restore past chat`

- Explanation: 
**L029** `  // Try to read JSON text from localStorage.`

- Explanation: 
**L030** `  const raw = localStorage.getItem(STORE_KEY); // might be null on first run`

- Explanation: 
**L031** `  // If we have saved data, parse it, otherwise make a new default object.`

- Explanation: 
**L032** `  const state = raw ? JSON.parse(raw) : { currentThreadId: null, threads: {} }; // create a shape for our storage`

- Explanation: 
**L033** `  // If there is a current thread id, use that; otherwise create a new one.`

- Explanation: 
**L034** `  if (state.currentThreadId && state.threads[state.currentThreadId]) { // check if a valid thread exists`

- Explanation: 
**L035** `    thread = state.threads[state.currentThreadId]; // restore the thread from storage`

- Explanation: 
**L036** `  } else {`

- Explanation: 
**L037** `    thread = { id: crypto.randomUUID(), model: modelSelect.value, messages: [] }; // make a fresh thread`

- Explanation: 
**L038** `    state.currentThreadId = thread.id; // remember it as current`

- Explanation: 
**L039** `    state.threads[thread.id] = thread; // store it in the map`

- Explanation: 
**L040** `    localStorage.setItem(STORE_KEY, JSON.stringify(state)); // save back to storage`

- Explanation: 
**L041** `  }`

- Explanation: 
**L042** `  // Also reflect the model in the dropdown UI.`

- Explanation: 
**L043** `  modelSelect.value = thread.model; // keep UI in sync with data`

- Explanation: 
**L044** `  // Finally, paint any existing messages to the screen.`

- Explanation: 
**L045** `  renderAll(); // show the past messages (if any)`

- Explanation: 
**L046** `} // end loadState`

- Explanation: 
**L047** ` `

- Explanation: 
**L048** `// Create a helper to save the whole app state back to localStorage.`

- Explanation: 
**L049** `function saveState() { // called whenever messages or model change`

- Explanation: 
**L050** `  // Read current saved object (or build a blank one).`

- Explanation: 
**L051** `  const raw = localStorage.getItem(STORE_KEY); // read existing storage`

- Explanation: 
**L052** `  const state = raw ? JSON.parse(raw) : { currentThreadId: thread.id, threads: {} }; // fallback shape`

- Explanation: 
**L053** `  // Ensure current thread id is set.`

- Explanation: 
**L054** `  state.currentThreadId = thread.id; // mark our thread as current`

- Explanation: 
**L055** `  // Put our thread into the threads map.`

- Explanation: 
**L056** `  state.threads[thread.id] = thread; // overwrite or insert the thread`

- Explanation: 
**L057** `  // Convert back to text and save.`

- Explanation: 
**L058** `  localStorage.setItem(STORE_KEY, JSON.stringify(state)); // persist to browser`

- Explanation: 
**L059** `} // end saveState`

- Explanation: 
**L060** ` `

- Explanation: 
**L061** `// Make a small helper that creates a message bubble DOM node.`

- Explanation: 
**L062** `function bubble(role, text, pending = false) { // role is 'user' or 'assistant', pending shows typing dots`

- Explanation: 
**L063** `  // Create a wrapper element for a single message.`

- Explanation: 
**L064** `  const item = document.createElement('div'); // this will hold the bubble`

- Explanation: 
**L065** `  // Choose left/right alignment based on who is speaking.`

- Explanation: 
**L066** `  item.className = role === 'user' ? 'flex justify-start' : 'flex justify-end'; // user on left, assistant on right`

- Explanation: 
**L067** `  // Create the bubble shape itself.`

- Explanation: 
**L068** `  const box = document.createElement('div'); // inner bubble box`

- Explanation: 
**L069** `  // Use colors based on who is speaking.`

- Explanation: 
**L070** `  box.className = role === 'user'`

- Explanation: 
**L071** `    ? 'max-w-[80%] rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-3'`

- Explanation: 
**L072** `    : 'max-w-[80%] rounded-2xl bg-indigo-500/20 ring-1 ring-indigo-300/30 px-4 py-3'; // subtle different styles`

- Explanation: 
**L073** `  // If this is a pending bubble, show three jumping dots.`

- Explanation: 
**L074** `  box.innerHTML = pending ? '<span class="inline-flex gap-1"><span class="animate-bounce">•</span><span class="animate-bounce [animation-delay:120ms]">•</span><span class="animate-bounce [animation-delay:240ms]">•</span></span>' : text; // typing or final text`

- Explanation: 
**L075** `  // Put the bubble into the wrapper.`

- Explanation: 
**L076** `  item.appendChild(box); // mount bubble into the item`

- Explanation: 
**L077** `  // Return the finished DOM node.`

- Explanation: 
**L078** `  return item; // caller will append to chatSurface`

- Explanation: 
**L079** `} // end bubble`

- Explanation: 
**L080** ` `

- Explanation: 
**L081** `// Render all messages currently in the thread to the chat surface.`

- Explanation: 
**L082** `function renderAll() { // clears chatSurface then appends each message bubble`

- Explanation: 
**L083** `  // Clear whatever is currently on the screen.`

- Explanation: 
**L084** `  chatSurface.innerHTML = ''; // start fresh`

- Explanation: 
**L085** `  // If there are no messages yet, keep the hero/empty section visible.`

- Explanation: 
**L086** `  document.getElementById('emptyState').style.display = thread.messages.length ? 'none' : 'block'; // toggle empty state`

- Explanation: 
**L087** `  // Loop through every message we have saved.`

- Explanation: 
**L088** `  for (const m of thread.messages) { // go in order`

- Explanation: 
**L089** `    // Create a bubble for each message.`

- Explanation: 
**L090** `    const node = bubble(m.role, m.content); // build bubble from data`

- Explanation: 
**L091** `    // Add it to the chat area.`

- Explanation: 
**L092** `    chatSurface.appendChild(node); // show on screen`

- Explanation: 
**L093** `  }`

- Explanation: 
**L094** `  // After rendering, scroll to the bottom.`

- Explanation: 
**L095** `  chatSurface.scrollTop = chatSurface.scrollHeight; // keep newest messages visible`

- Explanation: 
**L096** `} // end renderAll`

- Explanation: 
**L097** ` `

- Explanation: 
**L098** `// When the model dropdown changes, update the thread and save.`

- Explanation: 
**L099** `modelSelect.addEventListener('change', () => { // listen for user choosing a model`

- Explanation: 
**L100** `  thread.model = modelSelect.value; // record the new model choice`

- Explanation: 
**L101** `  saveState(); // persist the change`

- Explanation: 
**L102** `}); // end model change listener`

- Explanation: 
**L103** ` `

- Explanation: 
**L104** `// Listen for the form submit (clicking send or pressing Enter).`

- Explanation: 
**L105** `composer.addEventListener('submit', async (e) => { // main send handler`

- Explanation: 
**L106** `  // Stop the form from actually reloading the page.`

- Explanation: 
**L107** `  e.preventDefault(); // single page behavior`

- Explanation: 
**L108** `  // Read and trim the input text.`

- Explanation: 
**L109** `  const text = inputEl.value.trim(); // get user text`

- Explanation: 
**L110** `  // If there is nothing to send, do nothing.`

- Explanation: 
**L111** `  if (!text) return; // ignore empty messages`

- Explanation: 
**L112** ` `

- Explanation: 
**L113** `  // Build a message object for the user turn.`

- Explanation: 
**L114** `  const userMsg = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() }; // minimal fields`

- Explanation: 
**L115** `  // Push it into our thread memory.`

- Explanation: 
**L116** `  thread.messages.push(userMsg); // add to conversation`

- Explanation: 
**L117** `  // Save to localStorage so it survives refresh.`

- Explanation: 
**L118** `  saveState(); // persist after user sends`

- Explanation: 
**L119** `  // Repaint the screen including the new user message.`

- Explanation: 
**L120** `  renderAll(); // show latest state`

- Explanation: 
**L121** `  // Clear the input box for the next message.`

- Explanation: 
**L122** `  inputEl.value = ''; // reset composer`

- Explanation: 
**L123** ` `

- Explanation: 
**L124** `  // Create and show a temporary assistant bubble that looks like typing.`

- Explanation: 
**L125** `  const pendingNode = bubble('assistant', '', true); // pending=true shows animated dots`

- Explanation: 
**L126** `  // Put that bubble on the screen right away.`

- Explanation: 
**L127** `  chatSurface.appendChild(pendingNode); // visual feedback while waiting`

- Explanation: 
**L128** `  // Scroll so the user sees the typing indicator.`

- Explanation: 
**L129** `  chatSurface.scrollTop = chatSurface.scrollHeight; // keep it in view`

- Explanation: 
**L130** `  // Disable the send button so we don't double-send.`

- Explanation: 
**L131** `  sendBtn.disabled = true; // block extra clicks`

- Explanation: 
**L132** ` `

- Explanation: 
**L133** `  try { // start of network try/catch`

- Explanation: 
**L134** `    // Prepare the payload we send to our Netlify function.`

- Explanation: 
**L135** `    const payload = { // minimal fields the backend expects`

- Explanation: 
**L136** `      threadId: thread.id, // lets the server know which thread (for future use)`

- Explanation: 
**L137** `      model: thread.model, // gemini-1.5-flash or gemini-1.5-pro`

- Explanation: 
**L138** `      messages: [ // complete conversation so far`

- Explanation: 
**L139** `        { role: 'system', content: 'You are moon.ai — The Digital You. Be friendly, concise, and helpful. If unsure, say so briefly.' },`

- Explanation: 
**L140** `        ...thread.messages.map(m => ({ role: m.role, content: m.content })) // convert local messages`

- Explanation: 
**L141** `      ]`

- Explanation: 
**L142** `    }; // end payload`

- Explanation: 
**L143** ` `

- Explanation: 
**L144** `    // Call our serverless endpoint that hides the API key.`

- Explanation: 
**L145** `    const res = await fetch('/api/chat', { // Netlify function route we will deploy`

- Explanation: 
**L146** `      method: 'POST', // sending data`

- Explanation: 
**L147** `      headers: { 'Content-Type': 'application/json' }, // tell server we send JSON`

- Explanation: 
**L148** `      body: JSON.stringify(payload) // attach the payload text`

- Explanation: 
**L149** `    }); // end fetch`

- Explanation: 
**L150** ` `

- Explanation: 
**L151** `    // If the HTTP status is not OK, throw an error to the catch block.`

- Explanation: 
**L152** `    if (!res.ok) throw new Error('Network error ' + res.status); // simple error guard`

- Explanation: 
**L153** `    // Parse the JSON reply from the server.`

- Explanation: 
**L154** `    const data = await res.json(); // read { message: '...', usage: {...} }`

- Explanation: 
**L155** `    // Make a message object for the assistant's text.`

- Explanation: 
**L156** `    const botMsg = { id: crypto.randomUUID(), role: 'assistant', content: data.message, ts: Date.now() }; // assistant turn`

- Explanation: 
**L157** `    // Add the assistant message to the thread.`

- Explanation: 
**L158** `    thread.messages.push(botMsg); // store reply`

- Explanation: 
**L159** `    // Save the updated thread.`

- Explanation: 
**L160** `    saveState(); // persist after assistant replies`

- Explanation: 
**L161** `    // Replace the pending bubble with the final assistant bubble.`

- Explanation: 
**L162** `    pendingNode.replaceWith(bubble('assistant', botMsg.content)); // swap typing with content`

- Explanation: 
**L163** `    // Make sure we are scrolled to the latest message.`

- Explanation: 
**L164** `    chatSurface.scrollTop = chatSurface.scrollHeight; // show newest`

- Explanation: 
**L165** `  } catch (err) { // handle any error`

- Explanation: 
**L166** `    // Replace the pending bubble with a soft error bubble.`

- Explanation: 
**L167** `    pendingNode.replaceWith(bubble('assistant', '⚠️ Sorry, I had trouble replying. Please try again.')); // friendly failure message`

- Explanation: 
**L168** `  } finally { // always run after try/catch`

- Explanation: 
**L169** `    // Re-enable the send button so the user can send again.`

- Explanation: 
**L170** `    sendBtn.disabled = false; // restore button`

- Explanation: 
**L171** `  } // end try/catch/finally`

- Explanation: 
**L172** `}); // end submit handler`

- Explanation: 
**L173** ` `

- Explanation: 
**L174** `// Run once on page load to restore state and UI.`

- Explanation: 
**L175** `loadState(); // initialize the app`

- Explanation: 