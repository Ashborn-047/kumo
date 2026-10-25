// ============================================================
// ai.js — OpenRouter API Integration
// Handles all AI communication. Uses the OpenAI-compatible
// SDK pointed at OpenRouter's endpoint.
// Free models auto-selected by priority list.
// ============================================================
// TODO Phase 1: implement sendMessage with streaming
// TODO Phase 1: implement model auto-selector
// TODO Phase 6: add model switcher from settings

const OpenAI = require('openai');
const settingsStore = require('./settings');

// Free models in priority order (best first)
const FREE_MODELS = [
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3.5-lightning:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-flash-1.5:free',
  'deepseek/deepseek-r1:free',
  'mistralai/mistral-7b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
];

let client = null;
let activeModel = FREE_MODELS[0];

/**
 * Initialize the OpenRouter client with the user's API key.
 * Called once on app start after settings are loaded.
 */
function init(apiKey) {
  client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/Ashborn-047/kumo',
      'X-Title': 'Kumo',
    },
  });
}

/**
 * Send a message and stream the response back via callback.
 * @param {string} userMessage
 * @param {Array}  history       - prior messages [{role, content}]
 * @param {Function} onChunk    - called for each streamed token
 */
function buildSystemPrompt(cfg = {}) {
  const name = (cfg.companionName || 'Kumo').trim() || 'Kumo';
  const user = (cfg.userName || '').trim();
  const who = user ? ` The user's name is ${user}; address them by it when it feels natural.` : '';
  return `You are ${name}, a cute, helpful, friendly desktop assistant on Windows.${who}
Keep answers brief, pleasant, and warm (1-3 sentences max).
When the user asks you to do something on their computer, answer warmly and append an action block at the very end.
Format single action:
[ACTION:{"type":"ACTION_NAME","args":{...}}]
Format multiple actions:
[ACTIONS:[{"type":"ACTION_1","args":{...}},{"type":"ACTION_2","args":{...}}]]

Available actions:
- app.open: open any installed app (e.g. "spotify", "claude", "chatgpt", "telegram", "whatsapp", "steam", "blender", "word", "excel", "powerpoint", "code", "terminal", "notepad", "calculator", "paint", "settings", "photos", "weather", "camera"). args: {"name": "..."}
- process.kill: close, quit, or terminate an app or process. args: {"name": "..."}
- media.playPause: toggle play/pause for music or Spotify. args: {}
- media.next: skip to next song/track. args: {}
- media.previous: go to previous song/track. args: {}
- media.mute: toggle audio mute. args: {}
- media.volUp: raise volume. args: {}
- media.volDown: lower volume. args: {}
- file.write: create/save a note or text file on Desktop. args: {"fileName": "QuickNote", "content": "..."}
- app.interact: send text, draft a prompt, or paste clipboard into an open app (e.g. "claude", "chatgpt", "notepad", "code"). args: {"targetApp": "claude", "text": "...", "pressEnter": true}
- powershell.read: run safe read-only diagnostics or scripts (e.g. test connection, ping, ipconfig, system stats). args: {"command": "..."}
- clipboard.read: read clipboard text. args: {}
- clipboard.write: write text to clipboard. args: {"text": "..."}
- file.search: search files on PC. args: {"query": "..."}
- url.open: open URL in browser. args: {"url": "https://..."}
- folder.open: open folder ("downloads", "desktop", "documents", or path). args: {"folderPath": "..."}
- system.time: current time. args: {}
- system.date: today's date. args: {}
- system.info: check PC specs. args: {}

PROMPT & CLIPBOARD INTERACTION RULES:
1. When asked to "paste in [app]" or "paste into [app]" (e.g. "paste into Claude", "paste in Notepad"):
   Immediately trigger: [ACTION:{"type":"app.interact","args":{"targetApp":"claude","text":"","pressEnter":true}}]
   (Leaving text empty will paste the user's active clipboard into the target app).
2. When asked to prompt or ask an app something (e.g. "ask Claude to write a game", "give Claude a prompt about quantum computing"):
   PROACTIVELY DRAFT the prompt yourself in the "text" parameter and emit:
   [ACTION:{"type":"app.interact","args":{"targetApp":"claude","text":"<your drafted prompt>","pressEnter":true}}]
   NEVER ask the user what to paste or claim you cannot see the content. Always take action!

If no action is needed, just answer normally without any [ACTION:...] block.
Never delete files or run destructive commands.`;
}

/**
 * Send a message and stream the response back via callback.
 * @param {string} userMessage
 * @param {Array}  history       - prior messages [{role, content}]
 * @param {Function} onChunk    - called for each streamed token
 * @returns {string}             - full response text
 */
async function sendMessage(userMessage, history = [], onChunk) {
  if (!client) throw new Error('AI not initialized — API key missing');

  const cfg = settingsStore.get();
  const targetModel = cfg.model || activeModel;

  const formattedHistory = Array.isArray(history)
    ? history.slice(-20).map(item => ({
        role: (item.role === 'assistant' || item.role === 'goo' || item.role === 'model') ? 'assistant' : 'user',
        content: String(item.content || item.text || '')
      })).filter(item => item.content.trim().length > 0)
    : [];

  const messages = [
    { role: 'system', content: buildSystemPrompt(cfg) },
    ...formattedHistory,
    { role: 'user', content: userMessage },
  ];

  const stream = await client.chat.completions.create({
    model: targetModel,
    messages,
    stream: true,
    max_tokens: 1024,
  });

  let fullText = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || '';
    fullText += token;
    if (onChunk) onChunk(token);
  }

  return fullText;
}

/**
 * Mochiboard AI Canvas Assistant
 * Returns structured JSON for card creation, organization, and ideation
 */
async function askBoard(userPrompt, snapshot = {}) {
  if (!client) throw new Error('AI not initialized — API key missing');

  const cfg = settingsStore.get();
  const targetModel = cfg.model || activeModel;

  const boardSystem = `You are Mochi, the AI visual planner inside Mochiboard.
You help organize ideas into sticky notes, to-dos, and section titles on an infinite canvas.
Current board cards snapshot: ${JSON.stringify(snapshot).slice(0, 3000)}

Respond strictly in valid JSON format:
{
  "say": "Short friendly summary of your plan or suggestion",
  "add": [
    {
      "type": "note",
      "text": "Card text",
      "color": "purple"
    },
    {
      "type": "todo",
      "text": "Task title",
      "items": ["Step 1", "Step 2"],
      "color": "blue"
    }
  ],
  "titles": [
    { "text": "Section Title" }
  ]
}
Only output the JSON object, nothing else.`;

  const res = await client.chat.completions.create({
    model: targetModel,
    messages: [
      { role: 'system', content: boardSystem },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1024,
  });

  return res.choices[0]?.message?.content || '{}';
}

/**
 * Try each free model in order until one works.
 * Called once on startup to set activeModel.
 */
async function detectBestModel() {
  for (const model of FREE_MODELS) {
    try {
      await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      });
      activeModel = model;
      console.log(`[ai] Using model: ${model}`);
      return model;
    } catch {
      continue;
    }
  }
  throw new Error('No free models available on OpenRouter');
}

module.exports = { init, sendMessage, askBoard, detectBestModel, FREE_MODELS };
