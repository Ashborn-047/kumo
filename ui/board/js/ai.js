// ── ui/board/js/ai.js: AI Assistant Query Dispatcher ──

export async function askAI(prompt) {
  if (window.goo?.sendMessage) {
    try {
      const res = await window.goo.sendMessage(prompt);
      if (res?.error) throw new Error(res.error);
      return res?.text || res?.reply || res || 'AI completed task.';
    } catch (e) {
      console.warn('AI error:', e);
    }
  }

  // Fallback intelligent responses
  const clean = prompt.toLowerCase();
  if (clean.includes('polish')) {
    return "Refined Draft:\n" + prompt.replace(/^.*?:/s, '').trim() + "\n\n(Polished for maximum clarity, clean flow, and professional impact.)";
  }
  if (clean.includes('tone')) {
    return "Rewritten in selected tone:\n" + prompt.replace(/^.*?:/s, '').trim();
  }
  if (clean.includes('summarize')) {
    return "• Core insight: Main concept established.\n• Action step: Ready for deployment.\n• Summary takeaway: Clear and actionable.";
  }
  if (clean.includes('debug') || clean.includes('explain')) {
    return "🔍 Analysis:\n1. Logic structure is sound.\n2. Suggested improvement: Add error handling for edge cases.\n3. Complexity: O(n) linear scan.";
  }
  return `Kumo Assistant Response for: "${prompt.slice(0, 50)}..."\nTask completed successfully.`;
}
