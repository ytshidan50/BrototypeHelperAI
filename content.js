// content.js — Brototype AI Task Description Helper

(function () {
  'use strict';

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setReactValue(el, value) {
    if (!el) return;
    el.focus?.();
    try {
      const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) {
        desc.set.call(el, value);
      } else {
        el.value = value;
      }
    } catch (_) {
      el.value = value;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function simulateClick(el) {
    if (!el) return;
    el.focus?.();
    const opts = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new PointerEvent('pointerup', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.click?.();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Find "Topic N" headings that do not yet have an AI button in their card
  // ─────────────────────────────────────────────────────────────────────────

  function findTopicHeadings() {
    const candidates = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    return candidates.filter(h => {
      const text = h.textContent.trim();
      if (!/^Topic\s+\d+$/i.test(text)) return false;

      // Check if button is already injected in this card
      const p1 = h.parentElement;
      const p2 = p1?.parentElement;
      const p3 = p2?.parentElement;
      if (p3 && (p3.querySelector('.bai-btn-group') || p3.querySelector('.bai-header-btn'))) return false;
      if (p2 && (p2.querySelector('.bai-btn-group') || p2.querySelector('.bai-header-btn'))) return false;

      return true;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Comprehensive extraction of topic title & ALL description / subtopic text
  // ─────────────────────────────────────────────────────────────────────────

  function extractTopicDetails(card, infoArea, h6El) {
    const topicLabel = h6El ? h6El.textContent.trim() : '';

    // Collect all unique text from the infoArea (excluding "Topic N")
    const headerTexts = [];
    if (infoArea) {
      [...infoArea.querySelectorAll('*')].forEach(el => {
        if (el.children.length === 0) {
          const t = el.textContent.trim();
          if (t && !/^Topic\s+\d+$/i.test(t) && !headerTexts.includes(t)) {
            headerTexts.push(t);
          }
        }
      });
    }

    // Collect all body text (subtopics a, b, c, task details, books, instructions)
    const bodyTexts = [];
    if (card) {
      [...card.querySelectorAll('p, div, span, li, h1, h2, h3, h4, h5, h6')].forEach(el => {
        if (infoArea && infoArea.contains(el)) return false;
        if (el.closest('.bai-btn') || el.closest('#bai-overlay')) return false;
        if (el.children.length > 0) return false; // leaf text only
        const t = el.textContent.trim();
        if (!t || t.length <= 1) return false;

        // Skip website UI boilerplate
        if (t === 'Add Attachments' || t === 'No responses added yet' || t === 'Your Response') return false;
        if (t === '+' || t === '^' || t === 'v' || t === '✕') return false;
        if (headerTexts.includes(t)) return false;

        if (!bodyTexts.includes(t)) {
          bodyTexts.push(t);
        }
      });
    }

    // Main topic title: first header text, or fallback to label
    const title = headerTexts[0] || (topicLabel ? `${topicLabel} Task` : 'This Topic');

    // Combine everything into fullDescription
    const allBlocks = [...headerTexts, ...bodyTexts];
    const fullDescription = allBlocks.join('\n');

    return {
      topicLabel,
      title,
      fullDescription: fullDescription || title,
      hasBody: bodyTexts.length > 0
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Find chevron button/icon inside the card (outside the infoArea)
  // ─────────────────────────────────────────────────────────────────────────

  function findChevron(card, infoArea) {
    if (infoArea) {
      const hChevron = infoArea.querySelector('.css-v8yfrd, [class*="v8yfrd"], svg.lucide-chevron-down');
      if (hChevron) return hChevron;
    }
    const svgs = [...card.querySelectorAll('svg')].filter(s => {
      if (s.closest('.bai-btn') || s.closest('.bai-btn-group') || s.closest('#bai-overlay')) return false;
      return s.classList.contains('lucide-chevron-down') || s.parentElement?.classList?.contains('css-v8yfrd');
    });
    if (svgs.length > 0) {
      return svgs[0].closest('[class*="v8yfrd"]') || svgs[0].closest('button') || svgs[0].parentElement || svgs[0];
    }
    return infoArea?.querySelector('.css-v8yfrd, svg') || null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Ensure the card's accordion dropdown is expanded so body content is loaded
  // ─────────────────────────────────────────────────────────────────────────

  async function ensureExpanded(card, headerEl) {
    const isExpanded = () => {
      const t = findAddAttachmentsTrigger(card, headerEl);
      if (t && t.offsetHeight > 0) return true;
      const body = card.querySelector('div[style*="overflow: hidden"]');
      if (body) {
        const s = body.getAttribute('style') || '';
        if (s.includes('height: auto') || body.offsetHeight > 50) return true;
      }
      return false;
    };

    if (isExpanded()) return;

    // Try 1: Click the chevron container
    const chevron = headerEl.querySelector('.css-v8yfrd, [class*="v8yfrd"], svg.lucide-chevron-down, svg') ||
      findChevron(card, headerEl);
    if (chevron) {
      simulateClick(chevron);
    }

    // Poll for up to 600ms
    for (let i = 0; i < 6; i++) {
      await sleep(100);
      if (isExpanded()) return;
    }

    // Try 2: Click the title block of header row
    const titleBlock = headerEl.querySelector('.css-etax4g, h6') || headerEl;
    simulateClick(titleBlock);

    // Poll for up to 1000ms
    for (let i = 0; i < 10; i++) {
      await sleep(100);
      if (isExpanded()) return;
    }

    await sleep(200);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Quick Add: Hands-free automatic generate & submit
  // ─────────────────────────────────────────────────────────────────────────

  async function runQuickAdd(card, headerEl, h6El, btn) {
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="bai-btn-spinner"></span> Generating…';

    try {
      const settings = await getSettings();
      if (!settings.apiKey) {
        btn.innerHTML = '⚠️ Set Key';
        await sleep(2000);
        btn.innerHTML = origHtml;
        btn.disabled = false;
        chrome.runtime.openOptionsPage?.();
        return;
      }

      // 1. Ensure accordion dropdown is open so details exist in DOM
      await ensureExpanded(card, headerEl);

      // 2. Extract full task details & covered topics
      const details = extractTopicDetails(card, headerEl, h6El);
      const title = details.title || 'Task Description';
      const fullDesc = details.fullDescription || title;

      // 3. Generate description via background worker
      const resp = await chrome.runtime.sendMessage({
        type: 'GENERATE',
        payload: {
          service: settings.service,
          apiKey: settings.apiKey,
          model: settings.model,
          topicTitle: title,
          fullDescription: fullDesc,
          mode: 'generate',
          currentText: '',
        },
      });

      if (!resp || !resp.success || !resp.text) {
        throw new Error(resp?.error || 'No response from model');
      }

      // 4. Submit directly to Brototype's "Upload Attachment"
      btn.innerHTML = '<span class="bai-btn-spinner"></span> Adding…';
      await submitToResponse(card, headerEl, resp.text, 'Description', null);

      btn.innerHTML = '✓ Added!';
      btn.classList.add('bai-btn-success');
      await sleep(2500);
      btn.innerHTML = origHtml;
      btn.classList.remove('bai-btn-success');
      btn.disabled = false;
    } catch (err) {
      console.log('[BAI] Quick Add notice:', err.message);
      btn.innerHTML = '⚠️ Failed';
      await sleep(2500);
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Inject "Add" and "⚡ Quick Add" buttons into the header row
  // ─────────────────────────────────────────────────────────────────────────

  function injectButton(h6El) {
    const p1 = h6El.parentElement;        // css-etax4g
    const p2 = p1?.parentElement;         // css-1eui4x0 (header row flex container)
    const p3 = p2?.parentElement;         // css-1wate2x (full topic card)

    if (!p1 || !p2 || !p3) return;
    if (p2.querySelector('.bai-btn-group') || p3.querySelector('.bai-btn-group')) return;

    // Ensure header row doesn't wrap buttons to next line
    p2.style.flexWrap = 'nowrap';

    // Clean up any old injected buttons
    p3.querySelectorAll('.bai-header-btn').forEach(b => b.remove());

    const group = document.createElement('div');
    group.className = 'bai-btn-group';

    // 1. "Add" button (opens review & edit modal)
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'bai-hdr-btn bai-btn-add-modal';
    addBtn.setAttribute('data-bai-btn', 'true');
    addBtn.innerHTML = 'Add';
    addBtn.title = 'Generate, review, or edit description before adding';

    addBtn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      await ensureExpanded(p3, p2);
      await openModal(p3, p2, h6El);
    });
    addBtn.addEventListener('mousedown', e => { e.stopPropagation(); e.stopImmediatePropagation(); });
    addBtn.addEventListener('pointerdown', e => { e.stopPropagation(); e.stopImmediatePropagation(); });

    // 2. "Quick Add" button (one-click instant generate & submit)
    const quickAddBtn = document.createElement('button');
    quickAddBtn.type = 'button';
    quickAddBtn.className = 'bai-hdr-btn bai-btn-quick-add';
    quickAddBtn.setAttribute('data-bai-btn', 'true');
    quickAddBtn.innerHTML = 'Quick Add';
    quickAddBtn.title = '1-Click: automatically generate and submit description';

    quickAddBtn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      await runQuickAdd(p3, p2, h6El, quickAddBtn);
    });
    quickAddBtn.addEventListener('mousedown', e => { e.stopPropagation(); e.stopImmediatePropagation(); });
    quickAddBtn.addEventListener('pointerdown', e => { e.stopPropagation(); e.stopImmediatePropagation(); });

    group.appendChild(addBtn);
    group.appendChild(quickAddBtn);

    // Insert group right after p1 (the topic title block), directly inside the header row!
    p1.insertAdjacentElement('afterend', group);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Find "Add Attachments" trigger inside the card
  // ─────────────────────────────────────────────────────────────────────────

  function findAddAttachmentsTrigger(card, infoArea) {
    const candidates = [...card.querySelectorAll('h6, p, div, span')].filter(el => {
      if (infoArea && infoArea.contains(el)) return false;
      if (el.closest('.bai-btn') || el.closest('#bai-overlay')) return false;
      return el.textContent.trim() === 'Add Attachments';
    });

    if (candidates.length > 0) {
      const el = candidates[0];
      return el.closest('.css-1xztkao') || el.parentElement || el;
    }

    return [...card.querySelectorAll('*')].find(el => {
      if (infoArea && infoArea.contains(el)) return false;
      if (el.closest('.bai-btn') || el.closest('#bai-overlay')) return false;
      return el.textContent.trim().includes('Add Attachments') && el.children.length <= 4;
    }) || null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Modal UI
  // ─────────────────────────────────────────────────────────────────────────

  async function openModal(card, infoArea, h6El) {
    document.getElementById('bai-overlay')?.remove();

    // Ensure card is expanded first so all topic text & subtopics are in DOM
    await ensureExpanded(card, infoArea);
    const details = extractTopicDetails(card, infoArea, h6El);

    const { topicLabel, title, fullDescription } = details;

    const overlay = document.createElement('div');
    overlay.id = 'bai-overlay';
    overlay.className = 'bai-overlay';
    overlay.innerHTML = `
      <div class="bai-modal" role="dialog" aria-modal="true">
        <div class="bai-modal-header">
          <div>
            <p class="bai-modal-title">✨ AI Description Generator</p>
            <p class="bai-modal-topic">${escHtml(topicLabel ? `${topicLabel} • ${title}` : title)}</p>
          </div>
          <button class="bai-close-btn" id="bai-close" title="Close">✕</button>
        </div>
        <textarea
          class="bai-textarea"
          id="bai-text"
          placeholder="Generating task description based on all topic details…"
          spellcheck="true"
        ></textarea>
        <div class="bai-status" id="bai-status"></div>
        <div class="bai-actions">
          <button class="bai-action-btn bai-btn-generate" id="bai-generate">⚡ Generate</button>
          <button class="bai-action-btn bai-btn-grammar"  id="bai-grammar" disabled>✏️ Fix Grammar</button>
          <button class="bai-action-btn bai-btn-cancel"   id="bai-cancel">Cancel</button>
          <button class="bai-action-btn bai-btn-add"      id="bai-add" disabled>➕ Add to Response</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const textarea = overlay.querySelector('#bai-text');
    const statusEl = overlay.querySelector('#bai-status');
    const genBtn = overlay.querySelector('#bai-generate');
    const grammarBtn = overlay.querySelector('#bai-grammar');
    const addBtn = overlay.querySelector('#bai-add');

    function closeModal() {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
    function handleEsc(e) { if (e.key === 'Escape') closeModal(); }

    overlay.querySelector('#bai-close').addEventListener('click', closeModal);
    overlay.querySelector('#bai-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', handleEsc);

    textarea.addEventListener('input', () => {
      const has = textarea.value.trim().length > 0;
      grammarBtn.disabled = !has;
      addBtn.disabled = !has;
    });

    genBtn.addEventListener('click', () => runGenerate('generate'));
    grammarBtn.addEventListener('click', () => runGenerate('grammar'));

    async function runGenerate(mode) {
      const settings = await getSettings();
      if (!settings.apiKey) {
        showStatus('⚠️ No API key set. Click extension icon → Open Settings.', 'err');
        return;
      }

      setBusy(true);
      clearStatus();

      // Client-side 40-second safety timeout so it never hangs
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 40s. Please retry.')), 40000)
      );

      const sendPromise = chrome.runtime.sendMessage({
        type: 'GENERATE',
        payload: {
          service: settings.service,
          apiKey: settings.apiKey,
          model: settings.model,
          topicTitle: title,
          fullDescription: fullDescription,
          mode: mode,
          currentText: textarea.value.trim(),
        },
      });

      try {
        const resp = await Promise.race([sendPromise, timeoutPromise]);

        if (resp && resp.success) {
          textarea.value = resp.text;
          textarea.dispatchEvent(new Event('input'));
          showStatus('✓ Generated successfully!', 'ok');
        } else {
          showStatus('Error: ' + (resp?.error || 'No response received.'), 'err');
        }
      } catch (e) {
        showStatus('Error: ' + e.message, 'err');
      } finally {
        setBusy(false);
      }
    }

    function setBusy(busy) {
      genBtn.disabled = addBtn.disabled = grammarBtn.disabled = busy;
      genBtn.innerHTML = busy
        ? '<span class="bai-btn-spinner"></span> Generating…'
        : '⚡ Generate';
      if (!busy) {
        const has = textarea.value.trim().length > 0;
        grammarBtn.disabled = !has;
        addBtn.disabled = !has;
      }
    }

    function showStatus(msg, type) {
      statusEl.textContent = msg;
      statusEl.className = 'bai-status' + (type === 'ok' ? ' ok' : '');
    }
    function clearStatus() {
      statusEl.textContent = '';
      statusEl.className = 'bai-status';
    }

    // ── Add to Response ──
    addBtn.addEventListener('click', async () => {
      const text = textarea.value.trim();
      if (!text) return;

      addBtn.disabled = true;
      addBtn.textContent = '⏳ Adding…';

      try {
        await submitToResponse(card, infoArea, text, title, overlay);
        closeModal();
      } catch (e) {
        if (overlay) overlay.style.display = '';
        await navigator.clipboard.writeText(text).catch(() => { });
        showStatus(`Auto-submit notice: ${e.message}. Copied to clipboard!`, 'err');
        addBtn.textContent = '➕ Add to Response';
        addBtn.disabled = false;
      }
    });

    // Auto-generate on open
    getSettings().then(s => {
      if (s.apiKey) genBtn.click();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Submit description into the website's response area
  // ─────────────────────────────────────────────────────────────────────────

  async function submitToResponse(card, infoArea, text, topicTitle, overlay) {
    if (overlay) overlay.style.display = 'none';

    try {
      // 1. Ensure the card's accordion dropdown is expanded first
      await ensureExpanded(card, infoArea);

      // 2. Find the "Add Attachments" card
      let trigger = findAddAttachmentsTrigger(card, infoArea);
      if (!trigger) {
        throw new Error('"Add Attachments" button not found even after expanding.');
      }

      // Click "Add Attachments"
      simulateClick(trigger);
      await sleep(600);

      // Wait for the "Upload Attachment" dialog to appear
      const dialog = await waitForUploadDialog(4000);
      if (!dialog) {
        throw new Error('"Upload Attachment" dialog did not open.');
      }

      // Step 1: Fill in Attachment Title as "Description"
      const titleInput = dialog.querySelector('input[placeholder="Enter an attachment label"], input[type="text"]');
      if (titleInput) {
        setReactValue(titleInput, 'Description');
        await sleep(250);
      }

      // Step 2: Switch to "Text" Attachment Type
      const textTypeLabel = [...dialog.querySelectorAll('*')].find(el =>
        el.textContent.trim() === 'Text' && el.children.length === 0
      );
      const textTypeBtn = textTypeLabel?.closest('.css-1ertwqv, .css-11xag5p') || textTypeLabel?.parentElement || textTypeLabel;
      if (textTypeBtn) {
        simulateClick(textTypeBtn);
        await sleep(400);
      }

      // Step 3: Wait for and fill the Textarea
      const textArea = await waitForElement(() => {
        return dialog.querySelector('textarea[placeholder="Type your text here..."]:not([readonly]), textarea:not([readonly])');
      }, 3500);

      if (!textArea) {
        throw new Error('Textarea for typing description not found in dialog.');
      }

      setReactValue(textArea, text);
      await sleep(350);

      // Step 4: Click the "Upload" button
      const uploadBtn = [...dialog.querySelectorAll('div, button')].find(el =>
        el.textContent.trim() === 'Upload' && el.children.length === 0
      ) || dialog.querySelector('.css-zr389w');

      if (!uploadBtn) {
        throw new Error('Upload button not found in dialog.');
      }

      simulateClick(uploadBtn);
      await sleep(800);

      return true;
    } catch (err) {
      if (overlay) overlay.style.display = '';
      throw err;
    }
  }

  function waitForUploadDialog(timeoutMs = 4000) {
    return waitForElement(() => {
      return [...document.querySelectorAll('.MuiDialog-root, [role="dialog"]')].find(d =>
        d.textContent.includes('Upload Attachment') && d.textContent.includes('Attachment Type')
      ) || null;
    }, timeoutMs);
  }

  function waitForElement(checker, timeoutMs = 3000) {
    return new Promise(resolve => {
      const existing = checker();
      if (existing) return resolve(existing);

      const obs = new MutationObserver(() => {
        const found = checker();
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        obs.disconnect();
        resolve(checker() || null);
      }, timeoutMs);
    });
  }

  function getSettings() {
    return new Promise(resolve =>
      chrome.storage.sync.get(
        {
          service: 'gemini',
          apiKey: '',
          model: 'gemini-2.5-flash',
          temperature: 0.75,
          activeService: 'gemini',
          activeModel: 'gemini-2.5-flash',
          services: null,
        },
        saved => {
          let service = saved.activeService || saved.service || 'gemini';
          let model = saved.activeModel || saved.model || 'gemini-2.5-flash';
          let apiKey = saved.apiKey || '';

          if (saved.services && saved.services[service]) {
            apiKey = saved.services[service].apiKey || apiKey;
            model = saved.services[service].model || model;
          }

          if (!model || model.includes('1.5') || model.includes('2.0')) {
            model = 'gemini-2.5-flash';
          }

          resolve({
            service,
            apiKey,
            model,
            temperature: typeof saved.temperature === 'number' ? saved.temperature : 0.75,
          });
        }
      )
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Scan and Inject with MutationObserver
  // ─────────────────────────────────────────────────────────────────────────

  function scanAndInject() {
    const headings = findTopicHeadings();
    if (headings.length > 0) {
      headings.forEach(injectButton);
    }
  }

  scanAndInject();

  const observer = new MutationObserver(() => scanAndInject());
  observer.observe(document.body, { childList: true, subtree: true });

  [300, 700, 1500, 3000, 5000].forEach(d => setTimeout(scanAndInject, d));

  console.log('[BAI] Content script active ✓');
})();
