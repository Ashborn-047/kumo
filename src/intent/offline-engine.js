// ============================================================
// src/intent/offline-engine.js — Pattern Matching & Semantic Fallbacks
// ============================================================

const actions = require('../actions');
const { INTENT_PATTERNS, APP_ALIASES } = require('./patterns');
const { normalizeConversationalText, resolveFuzzyAppName } = require('./fuzzy');
const { formatOfflineSuccess } = require('./formatters');

async function processOffline(text) {
  const rawNormalized = text.toLowerCase().trim();
  const normalized = normalizeConversationalText(text) || rawNormalized;
  const actionResults = [];

  // Help command check
  if (/^(?:help|what\s+can\s+you\s+do|commands|features|capabilities)$/i.test(normalized)) {
    return {
      reply: `**Kumo Offline Mode Capabilities**:\n* **Apps**: "open spotify", "close notepad", "launch docker", "calculator"\n* **Audio**: "pause music", "next song", "volume up", "volume down", "mute"\n* **System**: "what's running", "system specs", "lock screen", "check internet"\n* **Notes & Typing**: "take a note: ideas", "a prompt in claude: write code"\n* **Mascot**: "sleep kumo", "minimize mascot"\n* **Files & Folders**: "open downloads", "find budget.xlsx"`,
      actionResults: [],
    };
  }

  // Try intent patterns on normalized text, then fallback to raw
  for (const candidate of [normalized, rawNormalized]) {
    for (const { pattern, action, extract } of INTENT_PATTERNS) {
      const match = candidate.match(pattern);
      if (match) {
        const args = extract(match);

        // Resolve app aliases & fuzzy typos across host apps
        if (action === 'app.open' && args.name) {
          args.name = resolveFuzzyAppName(args.name);
        }
        if (action === 'process.kill' && args.name) {
          args.name = resolveFuzzyAppName(args.name);
        }
        if (action === 'app.interact' && args.targetApp) {
          args.targetApp = resolveFuzzyAppName(args.targetApp);
        }

        const result = await actions.run(action, args);
        actionResults.push({ type: action, args, result });

        if (result.ok) {
          return {
            reply: formatOfflineSuccess(action, args, result),
            actionResults,
          };
        } else {
          return {
            reply: `[Alert] ${result.error || 'Could not complete that action.'}`,
            actionResults,
          };
        }
      }
    }
  }

  // Fallback 1: User just typed an application name! (e.g. "calculator", "docker", "cursor", "spotify")
  const directApp = resolveFuzzyAppName(normalized);
  if (directApp && (APP_ALIASES[normalized] || directApp !== normalized)) {
    const result = await actions.run('app.open', { name: directApp });
    actionResults.push({ type: 'app.open', args: { name: directApp }, result });
    if (result.ok) {
      return {
        reply: formatOfflineSuccess('app.open', { name: directApp }, result),
        actionResults,
      };
    } else {
      return {
        reply: `[Alert] ${result.error || 'Could not launch that application.'}`,
        actionResults,
      };
    }
  }

  // Fallback 2: General music query
  if (/^(?:music|songs?|play\s+something|listen\s+to\s+music)$/i.test(normalized)) {
    const result = await actions.run('media.playPause', {});
    actionResults.push({ type: 'media.playPause', args: {}, result });
    return {
      reply: formatOfflineSuccess('media.playPause', {}, result),
      actionResults,
    };
  }

  // No pattern matched — friendly fallback
  return {
    reply: `I'm in offline mode right now (no internet connection). I can still:\n* Open & close apps — "open spotify", "close notepad"\n* Media & volume — "pause spotify", "volume up", "mute"\n* System & tasks — "what's running", "system specs", "lock screen"\n* Send prompts & notes — "a prompt in claude: write a game", "take a note: ideas"\n* Sleep mascot — "sleep kumo"\n\nTry one of these!`,
    actionResults: [],
  };
}

module.exports = {
  processOffline,
};

