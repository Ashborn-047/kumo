// ── ui/board/js/tools/writer-tool.js: AI Assistant Studio & Multi-Agent Prompt Suite ──

import { askAI } from '../ai.js';
import { runSystemAction } from '../actions.js';

export function renderWriterHTML(card) {
  const model = card.data.model || 'Kumo Neural Engine';
  const tone = card.data.tone || 'Professional';
  const prompt = card.data.prompt || '';
  const response = card.data.response || '';
  const tokenEst = Math.round((prompt.length || 0) / 3.8);

  return `
    <!-- Frosted Soft Lilac Header -->
    <header class="h-12 bg-primary-fixed/40 border-b border-primary-fixed/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <!-- Tactile Window Dots -->
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs ml-1">
          <span class="material-symbols-outlined text-[18px]">psychology</span>
        </div>
        <div class="flex items-center gap-1.5">
          <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold card-title-text" title="Click to rename">${card.title || 'AI Assistant Studio'}</h2>
        </div>
        <!-- Model Selector Dropdown -->
        <div class="ml-1 relative">
          <select class="writer-model-select bg-surface-container-lowest text-label-sm font-label-sm text-primary font-semibold py-1 pl-2.5 pr-7 rounded-lg border-0 ring-1 ring-primary-container/30 focus:ring-2 focus:ring-primary-container cursor-pointer">
            <option ${model.includes('Kumo') ? 'selected' : ''}>Kumo Neural Engine</option>
            <option ${model.includes('Claude') ? 'selected' : ''}>Claude 3.5 Sonnet</option>
            <option ${model.includes('GPT-4o') ? 'selected' : ''}>GPT-4o</option>
            <option ${model.includes('DeepSeek') ? 'selected' : ''}>DeepSeek R1</option>
            <option ${model.includes('Gemini') ? 'selected' : ''}>Gemini Flash</option>
            <option ${model.includes('Ollama') ? 'selected' : ''}>Ollama Local</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-label-sm font-label-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/50 writer-engine-status">Engine Ready</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <!-- Card Body -->
    <div class="p-5 flex flex-col gap-4">
      <!-- Tone Modifier Chips with Tactile Micro-Interactions -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-label-sm font-label-sm text-secondary mr-1 font-semibold">TONE:</span>
        ${['Professional', 'Casual', 'Punchy', 'Deconstruct', 'Summarize'].map((t) => `
          <button class="tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 ${tone === t ? 'bg-primary-fixed text-primary font-semibold shadow-xs ring-1 ring-primary/30' : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container'} cursor-pointer" data-tone="${t}">
            ${t}
          </button>
        `).join('')}
      </div>

      <!-- Expanding Multi-Line Prompt Editor -->
      <div class="relative bg-surface-container-low rounded-2xl p-3 ring-1 ring-outline-variant/30 focus-within:ring-2 focus-within:ring-primary-container transition-all">
        <textarea class="writer-prompt-textarea w-full bg-transparent border-0 text-body-md font-body-md text-on-surface placeholder:text-secondary focus:ring-0 resize-none p-0 leading-relaxed" placeholder="Ask Kumo anything, draft instructions, or analyze codebase..." rows="3">${prompt}</textarea>
        <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20 mt-2">
          <div class="flex items-center gap-2">
            <button class="writer-attach-btn flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container active:scale-95 cursor-pointer" title="Insert clipboard text into prompt">
              <span class="material-symbols-outlined text-[16px]">attach_file</span>
              <span>Attach Clipboard</span>
            </button>
            <span class="writer-token-counter text-label-sm font-label-sm font-mono text-outline">${tokenEst} tokens</span>
          </div>
          <button class="writer-dispatch-btn flex items-center gap-1.5 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-xl hover:bg-primary text-body-sm font-body-sm font-medium shadow-sm active:scale-95 transition-all cursor-pointer">
            <span>Dispatch</span>
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
          </button>
        </div>
      </div>

      <!-- Live Streaming Response Panel Preview -->
      <div class="bg-surface-container-low/70 rounded-xl p-4 ring-1 ring-outline-variant/20 flex flex-col gap-2 relative">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary-container"></span>
            <span class="text-label-sm font-label-sm font-mono text-primary font-semibold uppercase">Response Output</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button class="writer-copy-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors cursor-pointer" title="Copy response to clipboard">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              <span>Copy</span>
            </button>
            <button class="writer-send-note-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors cursor-pointer" title="Send response to a Sticky Note">
              <span class="material-symbols-outlined text-[14px]">sticky_note_2</span>
              <span>Send to Note</span>
            </button>
            <button class="writer-clear-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors cursor-pointer" title="Clear response">
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
        </div>

        <!-- Syntactic preview markdown / response text -->
        <div class="writer-response-view font-mono text-body-sm font-body-sm text-on-surface space-y-1 max-h-48 overflow-y-auto whitespace-pre-wrap selection:bg-primary-fixed">
          ${response ? response : '<span class="text-secondary italic">Responses will stream here once prompt is dispatched.</span>'}
        </div>
      </div>
    </div>
  `;
}

export function attachWriterEvents(el, card, onSave, onToast) {
  const textarea = el.querySelector('.writer-prompt-textarea');
  const counter = el.querySelector('.writer-token-counter');
  const responseView = el.querySelector('.writer-response-view');
  const modelSelect = el.querySelector('.writer-model-select');

  // Input & token calculation
  textarea?.addEventListener('input', () => {
    card.data.prompt = textarea.value;
    const est = Math.round((textarea.value.length || 0) / 3.8);
    if (counter) counter.textContent = `${est} tokens`;
    onSave?.();
  });

  // Model switch
  modelSelect?.addEventListener('change', () => {
    card.data.model = modelSelect.value;
    onSave?.();
    onToast?.(`Model active: ${modelSelect.value}`);
  });

  // Tone chips
  el.querySelectorAll('.tone-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      card.data.tone = btn.dataset.tone;
      el.querySelectorAll('.tone-chip').forEach((c) => {
        c.className = 'tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container cursor-pointer';
      });
      btn.className = 'tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 bg-primary-fixed text-primary font-semibold shadow-xs ring-1 ring-primary/30 cursor-pointer';
      onSave?.();
      onToast?.(`Tone: ${card.data.tone}`);
    });
  });

  // Attach clipboard
  el.querySelector('.writer-attach-btn')?.addEventListener('click', async () => {
    try {
      const res = await runSystemAction('clipboard.read');
      const text = res?.result?.text || '';
      if (text) {
        textarea.value = (textarea.value ? textarea.value + '\n\n' : '') + text;
        card.data.prompt = textarea.value;
        const est = Math.round(textarea.value.length / 3.8);
        if (counter) counter.textContent = `${est} tokens`;
        onSave?.();
        onToast?.('Attached clipboard to prompt');
      } else {
        onToast?.('Clipboard is empty');
      }
    } catch {
      onToast?.('Could not access clipboard');
    }
  });

  // Dispatch prompt
  el.querySelector('.writer-dispatch-btn')?.addEventListener('click', async () => {
    const p = textarea?.value.trim();
    if (!p) {
      onToast?.('Please enter a prompt first');
      return;
    }

    onToast?.('Dispatching to assistant...');
    const statusPill = el.querySelector('.writer-engine-status');
    const startDispatch = Date.now();
    if (statusPill) {
      statusPill.textContent = 'Processing...';
      statusPill.className = 'text-label-sm font-label-sm font-mono text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full ring-1 ring-primary/40 animate-pulse writer-engine-status';
    }

    if (responseView) {
      responseView.textContent = 'Thinking...';
    }

    try {
      const styledPrompt = `[Tone: ${card.data.tone || 'Professional'}] ${p}`;
      const answer = await askAI(styledPrompt);
      const elapsed = Date.now() - startDispatch;
      card.data.response = answer;
      if (responseView) {
        responseView.textContent = answer;
      }
      if (statusPill) {
        statusPill.textContent = `${elapsed}ms`;
        statusPill.className = 'text-label-sm font-label-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/50 writer-engine-status';
      }
      onSave?.();
      onToast?.('Response received');
    } catch (err) {
      if (responseView) {
        responseView.textContent = `Error: ${err.message}`;
      }
      if (statusPill) {
        statusPill.textContent = 'Error';
        statusPill.className = 'text-label-sm font-label-sm font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full writer-engine-status';
      }
    }
  });

  // Copy response
  el.querySelector('.writer-copy-btn')?.addEventListener('click', async () => {
    const text = card.data.response;
    if (!text) {
      onToast?.('No response to copy');
      return;
    }
    await runSystemAction('clipboard.write', { text });
    onToast?.('Copied response to clipboard');
  });

  // Send to note
  el.querySelector('.writer-send-note-btn')?.addEventListener('click', () => {
    const text = card.data.response;
    if (!text) {
      onToast?.('No response to send');
      return;
    }
    const event = new CustomEvent('kumo:create-card', {
      detail: {
        type: 'notes',
        title: `AI Note: ${new Date().toLocaleTimeString()}`,
        scratchText: text,
      },
    });
    window.dispatchEvent(event);
    onToast?.('Sent response to new Sticky Note');
  });

  // Clear response
  el.querySelector('.writer-clear-btn')?.addEventListener('click', () => {
    card.data.response = '';
    if (responseView) {
      responseView.innerHTML = '<span class="text-secondary italic">Responses will stream here once prompt is dispatched.</span>';
    }
    onSave?.();
    onToast?.('Cleared response');
  });
}
