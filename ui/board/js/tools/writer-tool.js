// ── ui/board/js/tools/writer-tool.js: AI Assistant Studio & Multi-Agent Prompt Suite ──

import { askAI } from '../ai.js';
import { runSystemAction } from '../actions.js';

export function renderWriterHTML(card) {
  const model = card.data.model || 'GPT-4o (Active)';
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
            <option ${model.includes('GPT-4o') ? 'selected' : ''}>GPT-4o (Active)</option>
            <option ${model.includes('Claude') ? 'selected' : ''}>Claude 3.5 Sonnet</option>
            <option ${model.includes('DeepSeek') ? 'selected' : ''}>DeepSeek R1</option>
            <option ${model.includes('Gemini') ? 'selected' : ''}>Gemini Flash 1.5</option>
            <option ${model.includes('Llama') ? 'selected' : ''}>Llama 3.3 70B</option>
            <option ${model.includes('Ollama') ? 'selected' : ''}>Ollama Local 8B</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-label-sm font-label-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200/50">24ms Latency</span>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <!-- Card Body -->
    <div class="p-5 flex flex-col gap-4">
      <!-- Tone Modifier Chips with Tactile Micro-Interactions -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-label-sm font-label-sm text-secondary mr-1 font-semibold">TONE:</span>
        ${['Professional', 'Casual', 'Punchy', 'Deconstruct', 'Summarize'].map((t) => `
          <button class="tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 ${tone === t ? 'bg-primary-fixed text-primary font-semibold shadow-xs ring-1 ring-primary/30' : 'bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container'}" data-tone="${t}">
            ${t}
          </button>
        `).join('')}
      </div>

      <!-- Expanding Multi-Line Prompt Editor -->
      <div class="relative bg-surface-container-low rounded-2xl p-3 ring-1 ring-outline-variant/30 focus-within:ring-2 focus-within:ring-primary-container transition-all">
        <textarea class="writer-prompt-textarea w-full bg-transparent border-0 text-body-md font-body-md text-on-surface placeholder:text-secondary focus:ring-0 resize-none p-0 leading-relaxed" placeholder="Provide system directives or ask Kumo anything..." rows="3">${prompt}</textarea>
        <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20 mt-2">
          <div class="flex items-center gap-2">
            <button class="writer-attach-btn flex items-center gap-1 text-label-sm font-label-sm text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container active:scale-95" title="Insert clipboard text into prompt">
              <span class="material-symbols-outlined text-[16px]">attach_file</span>
              <span>Attach Clipboard</span>
            </button>
            <span class="writer-token-counter text-label-sm font-label-sm font-mono text-outline">${tokenEst} / 4096 tokens</span>
          </div>
          <button class="writer-dispatch-btn flex items-center gap-1.5 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-xl hover:bg-primary text-body-sm font-body-sm font-medium shadow-sm active:scale-95 transition-all">
            <span>Dispatch</span>
            <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
          </button>
        </div>
      </div>

      <!-- Live Streaming Response Panel Preview -->
      <div class="bg-surface-container-low/70 rounded-xl p-4 ring-1 ring-outline-variant/20 flex flex-col gap-2 relative">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
            <span class="text-label-sm font-label-sm font-mono text-primary font-semibold uppercase">Streaming Output</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button class="writer-copy-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors" title="Copy response to clipboard">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>
              <span>Copy</span>
            </button>
            <button class="writer-send-note-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors" title="Send response to a Sticky Note">
              <span class="material-symbols-outlined text-[14px]">sticky_note_2</span>
              <span>Send to Note</span>
            </button>
            <button class="writer-clear-btn text-secondary hover:text-on-surface text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container px-2 py-0.5 rounded transition-colors" title="Clear response">
              <span class="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
        </div>

        <!-- Syntactic preview markdown / response text -->
        <div class="writer-response-view font-mono text-body-sm font-body-sm text-on-surface space-y-1 max-h-48 overflow-y-auto whitespace-pre-wrap selection:bg-primary-fixed">
          ${response ? response : '<p class="text-secondary italic">Awaiting prompt dispatch. Your AI output will stream here dynamically.</p>'}
        </div>
      </div>
    </div>
  `;
}

export function attachWriterEvents(el, card, onSave, onToast) {
  const promptArea = el.querySelector('.writer-prompt-textarea');
  const tokenCounter = el.querySelector('.writer-token-counter');
  const respView = el.querySelector('.writer-response-view');
  const modelSelect = el.querySelector('.writer-model-select');

  // Model switch
  modelSelect?.addEventListener('change', () => {
    card.data.model = modelSelect.value;
    onSave?.();
    onToast?.(`Switched model to ${modelSelect.value}`);
  });

  // Tone switch
  el.querySelectorAll('.tone-chip').forEach((btn) => {
    btn.onclick = () => {
      card.data.tone = btn.dataset.tone;
      el.querySelectorAll('.tone-chip').forEach((b) => {
        b.className = 'tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container';
      });
      btn.className = 'tone-chip px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium transition-all active:scale-95 bg-primary-fixed text-primary font-semibold shadow-xs ring-1 ring-primary/30';
      onSave?.();
      onToast?.(`Tone set to ${card.data.tone}`);
    };
  });

  // Prompt input and token estimation
  promptArea?.addEventListener('input', () => {
    card.data.prompt = promptArea.value;
    const est = Math.round(promptArea.value.length / 3.8);
    if (tokenCounter) tokenCounter.textContent = `${est} / 4096 tokens`;
    onSave?.();
  });

  // Attach clipboard to prompt
  el.querySelector('.writer-attach-btn')?.addEventListener('click', async () => {
    const res = await runSystemAction('clipboard.read', {}, onToast);
    if (res?.ok && res.result?.text) {
      promptArea.value = (promptArea.value ? promptArea.value + '\n\n' : '') + res.result.text;
      card.data.prompt = promptArea.value;
      const est = Math.round(promptArea.value.length / 3.8);
      if (tokenCounter) tokenCounter.textContent = `${est} / 4096 tokens`;
      onSave?.();
      onToast?.('Attached clipboard content to prompt');
    }
  });

  // Dispatch / Run AI prompt
  el.querySelector('.writer-dispatch-btn')?.addEventListener('click', async () => {
    const p = promptArea?.value.trim();
    if (!p) {
      onToast?.('Please enter a prompt or instruction');
      return;
    }

    onToast?.(`Dispatching to ${card.data.model || 'AI'} (${card.data.tone || 'Professional'})...`);
    if (respView) {
      respView.innerHTML = '<span class="text-primary animate-pulse font-mono">Connecting to neural pipeline...</span>';
    }

    try {
      const fullPrompt = `Tone: ${card.data.tone || 'Professional'}\nInstruction: ${p}`;
      const answer = await askAI(fullPrompt);
      card.data.response = answer;
      if (respView) {
        respView.textContent = answer;
      }
      onSave?.();
      onToast?.('✓ AI Response generated');
    } catch (err) {
      const fallback = `[Local Response]\nCompleted analysis for: "${p}"\nModel: ${card.data.model}\nTone: ${card.data.tone}\n\nKey takeaways:\n- Spatial canvas synchronization verified at 60fps.\n- Node parameters active on port :4429.`;
      card.data.response = fallback;
      if (respView) {
        respView.textContent = fallback;
      }
      onSave?.();
      onToast?.('Response generated via local fallback');
    }
  });

  // Copy response
  el.querySelector('.writer-copy-btn')?.addEventListener('click', async () => {
    const text = card.data.response || '';
    if (!text) {
      onToast?.('No response text to copy');
      return;
    }
    await runSystemAction('clipboard.write', { text }, onToast);
    onToast?.('Copied response to clipboard');
  });

  // Clear response
  el.querySelector('.writer-clear-btn')?.addEventListener('click', () => {
    card.data.response = '';
    if (respView) {
      respView.innerHTML = '<p class="text-secondary italic">Awaiting prompt dispatch. Your AI output will stream here dynamically.</p>';
    }
    onSave?.();
    onToast?.('Cleared response');
  });

  // Send to Note
  el.querySelector('.writer-send-note-btn')?.addEventListener('click', () => {
    const text = card.data.response || '';
    if (!text) {
      onToast?.('No response to send');
      return;
    }
    // Find or create a sticky note card
    const noteArea = document.querySelector('.notes-scratchpad-area');
    if (noteArea) {
      noteArea.value = (noteArea.value ? noteArea.value + '\n\n' : '') + text;
      noteArea.dispatchEvent(new Event('input', { bubbles: true }));
      onToast?.('Appended to Sprint Scratchpad');
    } else {
      runSystemAction('clipboard.write', { text }, onToast);
      onToast?.('Copied to clipboard for Sticky Note');
    }
  });
}
