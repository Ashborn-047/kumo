// ============================================================
// intent-router.js — Smart Input Router
// Routes user input to Online Brain (LLM) or Offline Brain
// based on connectivity and API key availability.
// ============================================================

const ai = require('./ai');
const actions = require('./actions');
const settings = require('./settings');
const { INTENT_PATTERNS, APP_ALIASES } = require('./intent/patterns');
const { processOffline } = require('./intent/offline-engine');
const { isOnline } = require('./intent/connectivity');
const { formatActionResult } = require('./intent/formatters');

/**
 * Main router: decides online vs offline and processes accordingly.
 * This is the entry point from main.js IPC handler.
 * 
 * @param {string} text - User's message
 * @param {Array|Function} [historyOrOnChunk] - Prior message history [{role, content}] or streaming callback
 * @param {Function} [maybeOnChunk] - Streaming callback if history was provided
 * @returns {{ ok: boolean, reply: string, source: 'online'|'offline' }}
 */
async function route(text, historyOrOnChunk = [], maybeOnChunk = null) {
  let history = [];
  let onChunk = null;

  if (typeof historyOrOnChunk === 'function') {
    onChunk = historyOrOnChunk;
    history = [];
  } else if (Array.isArray(historyOrOnChunk)) {
    history = historyOrOnChunk;
    onChunk = maybeOnChunk;
  } else {
    onChunk = maybeOnChunk;
  }

  const cfg = settings.get();

  // If no API key, always go offline
  if (!cfg.apiKey) {
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
  }

  // Check connectivity
  const online = typeof module.exports.isOnline === 'function' ? await module.exports.isOnline() : await isOnline();

  if (!online) {
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
  }

  // Online path — use LLM
  try {
    let fullText = '';
    const rawReply = await ai.sendMessage(text, history, (token) => {
      fullText += token;
      if (onChunk) onChunk(token);
    });

    const actionResults = [];

    // Support multiple actions: [ACTIONS:[{...},{...}]]
    const multiMatch = rawReply.match(/\[ACTIONS:\s*(\[.*?\])\s*\]/s);
    if (multiMatch) {
      try {
        const actionList = JSON.parse(multiMatch[1]);
        let cleanReply = rawReply.replace(multiMatch[0], '').trim();

        for (const actionData of actionList) {
          const res = await actions.run(actionData.type, actionData.args);
          actionResults.push({ type: actionData.type, args: actionData.args, result: res });
          const desc = formatActionResult(actionData.type, actionData.args, res);
          if (desc) cleanReply += (cleanReply ? '\n' : '') + desc;
        }

        return { ok: true, reply: cleanReply || 'Done!', source: 'online', actionResults };
      } catch (e) {
        console.warn('[intent-router] Multi-action parse failed:', e);
      }
    }

    // Single action: [ACTION:{...}] (support nested objects and multiline JSON)
    const singleMatch = rawReply.match(/\[ACTION:\s*(\{[\s\S]*?\})\s*\]/s) || rawReply.match(/\[ACTION:\s*(\{[\s\S]*\})\s*\]/s);
    if (singleMatch) {
      try {
        const actionData = JSON.parse(singleMatch[1]);
        const cleanReply = rawReply.replace(singleMatch[0], '').trim();

        const res = await actions.run(actionData.type, actionData.args);
        actionResults.push({ type: actionData.type, args: actionData.args, result: res });
        const extra = formatActionResult(actionData.type, actionData.args, res);
        const finalReply = (cleanReply ? cleanReply + '\n' + extra : extra).trim();

        return { ok: true, reply: finalReply || 'Done!', source: 'online', actionResults };
      } catch (e) {
        console.warn('[intent-router] Single-action parse failed:', e.message);
      }
    }

    return { ok: true, reply: rawReply, source: 'online', actionResults: [] };

  } catch (err) {
    console.warn('[intent-router] Online brain failed, falling back to offline:', err.message);
    const result = await processOffline(text);
    return { ok: true, reply: result.reply, source: 'offline', actionResults: result.actionResults };
  }
}

module.exports = {
  route,
  processOffline,
  isOnline,
  INTENT_PATTERNS,
  APP_ALIASES,
};
