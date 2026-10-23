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

// Free models in priority order (best first)
const FREE_MODELS = [
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
const SYSTEM_PROMPT = `You are Kumo, a cute, helpful, friendly desktop assistant on Windows.
Keep answers brief, pleasant, and warm (1-3 sentences max).
When the user asks you to do something on their computer, answer warmly and append an action block at the very end in this exact format:
[ACTION:{"type":"ACTION_NAME","args":{...}}]

Available actions:
- clipboard.read: read clipboard text. args: {}
- clipboard.write: write text to clipboard. args: {"text": "..."}
- file.search: search files on PC. args: {"query": "..."}
- url.open: open URL in browser. args: {"url": "https://..."}
- app.open: open an app (e.g. "calc", "notepad", "code", "chrome", "paint", "explorer"). args: {"name": "..."}
- folder.open: open folder ("downloads", "desktop", "documents", or path). args: {"folderPath": "..."}
- system.time: current time. args: {}
- system.date: today's date. args: {}
- system.info: check PC specs. args: {}

If no action is needed, just answer normally without any [ACTION:...] block.
Never delete files or run dangerous commands.`;

/**
 * Send a message and stream the response back via callback.
 * @param {string} userMessage
 * @param {Array}  history       - prior messages [{role, content}]
 * @param {Function} onChunk    - called for each streamed token
 * @returns {string}             - full response text
 */
async function sendMessage(userMessage, history = [], onChunk) {
  if (!client) throw new Error('AI not initialized — API key missing');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const stream = await client.chat.completions.create({
    model: activeModel,
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
    model: activeModel,
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
