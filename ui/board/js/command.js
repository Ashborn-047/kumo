// ── ui/board/js/command.js: Universal Command Palette (Ctrl+K) ──

import { runSystemAction } from './actions.js';
import { askAI } from './ai.js';

export function initCommandPalette(onAddNewTool, onToast) {
  const modal = document.querySelector('#cmd-modal');
  const input = document.querySelector('#cmd-modal-input') || document.querySelector('#modal-cmd-input');
  const respBox = document.querySelector('#cmd-response');
  const headerSearchInput = document.querySelector('#cmd-input');

  const openCmd = (initialVal = '') => {
    modal.classList.remove('hidden');
    if (input) {
      input.value = initialVal;
      input.focus();
    }
    if (respBox) {
      respBox.classList.add('hidden');
      respBox.textContent = '';
    }
  };

  const closeCmd = () => {
    modal.classList.add('hidden');
  };

  // Wire header search pill
  if (headerSearchInput) {
    headerSearchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = headerSearchInput.value;
        headerSearchInput.value = '';
        openCmd(val);
        executeCommand(val);
      }
    };
    headerSearchInput.onfocus = () => {
      openCmd(headerSearchInput.value);
    };
  }

  document.querySelector('#command-bar')?.addEventListener('click', (e) => {
    if (e.target !== headerSearchInput) openCmd();
  });

  document.querySelector('#cmd-modal-close')?.addEventListener('click', closeCmd);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeCmd();
  });

  // Keyboard shortcut Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCmd();
    } else if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
      closeCmd();
    }
  });

  const executeCommand = async (cmd) => {
    if (!cmd.trim() || !respBox) return;
    respBox.classList.remove('hidden');
    respBox.textContent = '✨ Kumo is processing command...';

    const clean = cmd.trim().toLowerCase();

    // 1. App Launches
    if (clean.includes('spotify')) {
      await runSystemAction('app.open', { name: 'spotify' }, onToast);
      respBox.textContent = '🎧 Spotify launched successfully!';
      onToast?.('Spotify launched');
      setTimeout(closeCmd, 1200);
      return;
    }
    if (clean.includes('vs code') || clean.includes('code')) {
      await runSystemAction('app.open', { name: 'code' }, onToast);
      respBox.textContent = '💻 VS Code launched successfully!';
      onToast?.('VS Code launched');
      setTimeout(closeCmd, 1200);
      return;
    }
    if (clean.includes('chrome') || clean.includes('browser')) {
      await runSystemAction('app.open', { name: 'chrome' }, onToast);
      respBox.textContent = '🌐 Chrome launched successfully!';
      onToast?.('Browser launched');
      setTimeout(closeCmd, 1200);
      return;
    }

    // 2. Direct Web URLs
    if (clean.startsWith('http') || clean.includes('.com') || clean.includes('.org')) {
      const url = clean.startsWith('http') ? clean : 'https://' + clean;
      await runSystemAction('url.open', { url }, onToast);
      respBox.textContent = `🌐 Opened ${url}`;
      setTimeout(closeCmd, 1200);
      return;
    }

    // 3. File Search
    if (clean.includes('search') || clean.includes('find')) {
      const query = clean.replace(/^(search|find)\s*(files|desktop|downloads)?\s*(for)?/i, '').trim();
      const res = await runSystemAction('file.search', { query }, onToast);
      if (res?.ok && res.result?.results?.length) {
        respBox.textContent = '📁 Found files:\n' + res.result.results.slice(0, 5).join('\n');
      } else {
        respBox.textContent = `No files found matching "${query}"`;
      }
      return;
    }

    // 4. Writing Intent
    if (clean.includes('draft') || clean.includes('write an email') || clean.includes('write a note')) {
      const draftText = await askAI(cmd);
      onAddNewTool?.('writer', { title: 'Generated Draft', text: draftText });
      respBox.textContent = '✍️ Drafted and created Writing Suite card!';
      setTimeout(closeCmd, 1200);
      return;
    }

    // 5. Code Intent
    if (clean.includes('python') || clean.includes('script') || clean.includes('javascript') || clean.includes('powershell')) {
      const codeText = await askAI(`Write code for: ${cmd}`);
      onAddNewTool?.('code', { title: 'Generated Script', code: codeText });
      respBox.textContent = '💻 Generated script and created Code Sandbox card!';
      setTimeout(closeCmd, 1200);
      return;
    }

    // 6. Design Intent
    if (clean.includes('palette') || clean.includes('color')) {
      onAddNewTool?.('design');
      respBox.textContent = '🎨 Created Design Studio card with color harmonies!';
      setTimeout(closeCmd, 1200);
      return;
    }

    // 7. General AI Question
    const reply = await askAI(cmd);
    respBox.textContent = reply;
  };

  if (input) {
    input.onkeydown = (e) => {
      if (e.key === 'Enter') executeCommand(input.value);
    };
  }

  document.querySelectorAll('.cmd-chip').forEach((chip) => {
    chip.onclick = () => {
      const c = chip.dataset.cmd;
      if (input) input.value = c;
      executeCommand(c);
    };
  });
}
