// popup.js — Mini Control Center for Brototype Helper AI
// Developed by YTS Developments (https://shidan.mangmc.in/)

const PROVIDER_MODELS = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Recommended)' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Fastest)' },
    { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Deep Quality)' },
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Recommended)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast & Recommended)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
};

const PROVIDER_NAMES = {
  gemini: 'Google Gemini',
  openai: 'OpenAI (ChatGPT)',
  anthropic: 'Anthropic (Claude)',
};

// DOM References
const tabHome = document.getElementById('tab-home');
const tabManage = document.getElementById('tab-manage');
const tabTasks = document.getElementById('tab-tasks');
const viewHome = document.getElementById('view-home');
const viewManage = document.getElementById('view-manage');

const homeEmpty = document.getElementById('home-empty');
const homeConfigured = document.getElementById('home-configured');
const homeGotoManage = document.getElementById('home-goto-manage');
const homeServiceSelect = document.getElementById('home-service-select');
const homeModelSelect = document.getElementById('home-model-select');
const tempSlider = document.getElementById('temp-slider');
const tempVal = document.getElementById('temp-val');
const homeToast = document.getElementById('home-toast');

const manageFormTitle = document.getElementById('manage-form-title');
const manageCancelEdit = document.getElementById('manage-cancel-edit');
const manageService = document.getElementById('manage-service');
const manageKey = document.getElementById('manage-key');
const toggleKeyEye = document.getElementById('toggle-key-eye');
const manageSaveBtn = document.getElementById('manage-save-btn');
const servicesContainer = document.getElementById('services-container');
const manageToast = document.getElementById('manage-toast');

let appState = {
  activeService: 'gemini',
  activeModel: 'gemini-2.5-flash',
  temperature: 0.75,
  services: {},
};

let editingService = null;

// ── Tab Navigation ─────────────────────────────────────────────────────────
function switchTab(viewName) {
  if (viewName === 'home') {
    tabHome.classList.add('active');
    tabManage.classList.remove('active');
    viewHome.classList.add('active');
    viewManage.classList.remove('active');
  } else if (viewName === 'manage') {
    tabManage.classList.add('active');
    tabHome.classList.remove('active');
    viewManage.classList.add('active');
    viewHome.classList.remove('active');
  }
}

tabHome.addEventListener('click', () => switchTab('home'));
tabManage.addEventListener('click', () => switchTab('manage'));
homeGotoManage.addEventListener('click', () => switchTab('manage'));

// ── "Tasks ↗" Navigation Button ───────────────────────────────────────────
tabTasks.addEventListener('click', () => {
  const targetUrl = 'https://student.brototype.com/tasks/module/details';

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = tab?.url || '';
    const isNewOrBrototype =
      !url ||
      url === 'about:blank' ||
      url.startsWith('chrome://newtab') ||
      url.includes('student.brototype.com');

    if (isNewOrBrototype && tab?.id) {
      chrome.tabs.update(tab.id, { url: targetUrl });
    } else {
      chrome.tabs.create({ url: targetUrl });
    }
    window.close();
  });
});

// ── Populate Models Dropdown Helper ────────────────────────────────────────
function populateModelSelect(selectEl, serviceKey, selectedModel) {
  selectEl.innerHTML = '';
  const models = PROVIDER_MODELS[serviceKey] || [];
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = m.label;
    if (m.value === selectedModel) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

// ── Render Views ───────────────────────────────────────────────────────────
function renderHomeView() {
  const serviceKeys = Object.keys(appState.services || {});

  if (serviceKeys.length === 0) {
    homeEmpty.style.display = 'flex';
    homeConfigured.style.display = 'none';
    return;
  }

  homeEmpty.style.display = 'none';
  homeConfigured.style.display = 'flex';

  // Make sure activeService is valid
  if (!appState.services[appState.activeService]) {
    appState.activeService = serviceKeys[0];
  }

  // Populate Home Provider Select
  homeServiceSelect.innerHTML = '';
  serviceKeys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = PROVIDER_NAMES[k] || k;
    if (k === appState.activeService) opt.selected = true;
    homeServiceSelect.appendChild(opt);
  });

  // Populate Home Model Select for active provider
  const curModel = appState.activeModel || appState.services[appState.activeService]?.model || 'gemini-2.5-flash';
  populateModelSelect(homeModelSelect, appState.activeService, curModel);

  // Temperature
  tempSlider.value = appState.temperature ?? 0.75;
  tempVal.textContent = parseFloat(tempSlider.value).toFixed(2);
}

function renderManageView() {
  const serviceKeys = Object.keys(appState.services || {});
  servicesContainer.innerHTML = '';

  if (serviceKeys.length === 0) {
    servicesContainer.innerHTML = `
      <div style="text-align:center; padding:12px; font-size:11px; color:#8b949e;">
        No services added yet. Add your first provider above!
      </div>
    `;
    return;
  }

  serviceKeys.forEach(key => {
    const s = appState.services[key];
    const isActive = (key === appState.activeService);
    const maskedKey = s.apiKey
      ? (s.apiKey.length > 10 ? `${s.apiKey.slice(0, 6)}••••${s.apiKey.slice(-4)}` : '••••••••')
      : 'No key set';

    const item = document.createElement('div');
    item.className = `service-item ${isActive ? 'active-provider' : ''}`;
    item.innerHTML = `
      <div class="service-info">
        <h4>
          ${PROVIDER_NAMES[key] || key}
          ${isActive ? '<span class="active-tag">Active</span>' : ''}
        </h4>
        <p>${maskedKey} • <span style="color:#58a6ff;">${s.model || 'Default'}</span></p>
      </div>
      <div class="service-actions">
        ${!isActive ? `<button class="icon-action-btn set-active-btn" data-key="${key}" title="Set as Active">⚡ Use</button>` : ''}
        <button class="icon-action-btn edit-btn" data-key="${key}" title="Edit Key">✏️</button>
        <button class="icon-action-btn del-btn" data-key="${key}" title="Delete">🗑️</button>
      </div>
    `;
    servicesContainer.appendChild(item);
  });

  // Attach action listeners
  servicesContainer.querySelectorAll('.set-active-btn').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.key;
      appState.activeService = k;
      appState.activeModel = appState.services[k]?.model || 'gemini-2.5-flash';
      saveAppState('Active provider switched to ' + PROVIDER_NAMES[k]);
    });
  });

  servicesContainer.querySelectorAll('.edit-btn').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.key;
      startEditService(k);
    });
  });

  servicesContainer.querySelectorAll('.del-btn').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.key;
      delete appState.services[k];
      if (appState.activeService === k) {
        const remaining = Object.keys(appState.services);
        appState.activeService = remaining[0] || 'gemini';
        appState.activeModel = appState.services[appState.activeService]?.model || 'gemini-2.5-flash';
      }
      saveAppState('Provider removed.');
    });
  });
}

function startEditService(serviceKey) {
  editingService = serviceKey;
  manageFormTitle.textContent = `Edit ${PROVIDER_NAMES[serviceKey] || serviceKey}`;
  manageCancelEdit.style.display = 'inline-block';
  manageService.value = serviceKey;
  manageService.disabled = true;

  const s = appState.services[serviceKey];
  manageKey.value = s?.apiKey || '';
  manageSaveBtn.innerHTML = '<span>💾 Update Provider</span>';
  manageKey.focus();
}

manageCancelEdit.addEventListener('click', () => {
  resetManageForm();
});

function resetManageForm() {
  editingService = null;
  manageFormTitle.textContent = 'Add AI Service';
  manageCancelEdit.style.display = 'none';
  manageService.disabled = false;
  manageKey.value = '';
  manageSaveBtn.innerHTML = '<span>➕ Add Provider</span>';
}

// ── Form Interactions ──────────────────────────────────────────────────────
toggleKeyEye.addEventListener('click', () => {
  const isPass = manageKey.type === 'password';
  manageKey.type = isPass ? 'text' : 'password';
  toggleKeyEye.textContent = isPass ? '🙈' : '👁';
});

manageSaveBtn.addEventListener('click', () => {
  const serviceKey = manageService.value;
  const keyVal = manageKey.value.trim();

  if (!keyVal) {
    showToast(manageToast, 'Please enter an API key.', 'err');
    return;
  }

  if (!appState.services) appState.services = {};

  // Keep existing model if already set, or default to first model of provider
  const defaultModel = PROVIDER_MODELS[serviceKey]?.[0]?.value || 'gemini-2.5-flash';
  const assignedModel = appState.services[serviceKey]?.model || defaultModel;

  appState.services[serviceKey] = {
    apiKey: keyVal,
    model: assignedModel,
  };

  // If first service or editing active service, keep it active
  if (!appState.activeService || editingService === appState.activeService || Object.keys(appState.services).length === 1) {
    appState.activeService = serviceKey;
    appState.activeModel = assignedModel;
  }

  resetManageForm();
  saveAppState(`✓ ${PROVIDER_NAMES[serviceKey]} saved!`);
});

// Home View Interactions
homeServiceSelect.addEventListener('change', () => {
  const newSvc = homeServiceSelect.value;
  appState.activeService = newSvc;
  appState.activeModel = appState.services[newSvc]?.model || PROVIDER_MODELS[newSvc]?.[0]?.value;
  populateModelSelect(homeModelSelect, newSvc, appState.activeModel);
  saveAppState(`Active service set to ${PROVIDER_NAMES[newSvc]}`);
});

homeModelSelect.addEventListener('change', () => {
  appState.activeModel = homeModelSelect.value;
  if (appState.services[appState.activeService]) {
    appState.services[appState.activeService].model = appState.activeModel;
  }
  saveAppState('Model updated.');
});

tempSlider.addEventListener('input', () => {
  const v = parseFloat(tempSlider.value).toFixed(2);
  tempVal.textContent = v;
  appState.temperature = parseFloat(v);
});

tempSlider.addEventListener('change', () => {
  saveAppState('Temperature saved.');
});

// ── Storage Sync Helper ────────────────────────────────────────────────────
function saveAppState(msg) {
  const toSync = {
    activeService: appState.activeService,
    activeModel: appState.activeModel,
    temperature: appState.temperature,
    services: appState.services,
    // Keep legacy keys populated so any older script reads smoothly
    service: appState.activeService,
    apiKey: appState.services[appState.activeService]?.apiKey || '',
    model: appState.activeModel,
  };

  chrome.storage.sync.set(toSync, () => {
    renderHomeView();
    renderManageView();
    if (msg) {
      showToast(homeToast, msg, 'ok');
      showToast(manageToast, msg, 'ok');
    }
  });
}

function showToast(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `status-toast ${type}`;
  setTimeout(() => {
    el.className = 'status-toast';
    el.textContent = '';
  }, 2200);
}

// ── Load Settings on Startup ───────────────────────────────────────────────
chrome.storage.sync.get(
  {
    activeService: 'gemini',
    activeModel: 'gemini-2.5-flash',
    temperature: 0.75,
    services: null,
    // Legacy support
    service: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
  },
  saved => {
    appState.activeService = saved.activeService || saved.service || 'gemini';
    appState.activeModel = saved.activeModel || saved.model || 'gemini-2.5-flash';
    appState.temperature = typeof saved.temperature === 'number' ? saved.temperature : 0.75;
    appState.services = saved.services || {};

    // Auto-migrate legacy apiKey if no services object was present
    if (Object.keys(appState.services).length === 0 && saved.apiKey) {
      appState.services[appState.activeService] = {
        apiKey: saved.apiKey,
        model: appState.activeModel,
      };
    }

    // Auto-migrate any deprecated model names
    if (appState.activeModel.includes('1.5') || appState.activeModel.includes('2.0')) {
      appState.activeModel = 'gemini-2.5-flash';
      if (appState.services.gemini) {
        appState.services.gemini.model = 'gemini-2.5-flash';
      }
    }

    renderHomeView();
    renderManageView();

    checkForUpdates();
  }
);

// ── Check for Updates via GitHub Releases ──────────────────────────────────
async function checkForUpdates() {
  try {
    const currentVersion = chrome.runtime.getManifest().version;
    const repos = [
      'ytshidan50/BrototypeHelperAI',
      'ytshidan/Brototype-Helper-AI',
      'ytshidan/Brototype-AI-Task-Assistant'
    ];

    let data = null;
    let usedRepo = repos[0];

    for (const repo of repos) {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
        if (res.ok) {
          data = await res.json();
          usedRepo = repo;
          break;
        }
      } catch (_) { }
    }

    if (data) {
      const latestTag = (data.tag_name || '').replace(/^v/, '');
      if (latestTag && isNewerVersion(currentVersion, latestTag)) {
        const banner = document.getElementById('update-banner');
        const verSpan = document.getElementById('update-version');
        const link = document.getElementById('update-link');
        verSpan.textContent = `v${latestTag}`;
        link.href = data.html_url || `https://github.com/${usedRepo}/releases`;
        banner.classList.add('visible');
      }
    }
  } catch (_) { }
}

function isNewerVersion(current, latest) {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const numC = c[i] || 0;
    const numL = l[i] || 0;
    if (numL > numC) return true;
    if (numL < numC) return false;
  }
  return false;
}
