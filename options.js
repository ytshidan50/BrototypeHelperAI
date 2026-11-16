// options.js

const MODELS = {
  gemini: [
    { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash (Fast & Recommended)' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Fastest)' },
    { value: 'gemini-3.8-flash',      label: 'Gemini 3.8 Flash' },
    { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro (High Quality)' },
  ],
  openai: [
    { value: 'gpt-4o-mini',         label: 'GPT-4o Mini (Recommended)' },
    { value: 'gpt-4o',              label: 'GPT-4o' },
    { value: 'gpt-4-turbo',         label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo',       label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-3-haiku-20240307',    label: 'Claude 3 Haiku (Recommended)' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229',     label: 'Claude 3 Opus' },
  ],
};

const serviceSelect  = document.getElementById('service-select');
const modelSelect    = document.getElementById('model-select');
const apiKeyInput    = document.getElementById('api-key');
const toggleKeyBtn   = document.getElementById('toggle-key');
const tempSlider     = document.getElementById('temperature');
const tempDisplay    = document.getElementById('temp-display');
const saveBtn        = document.getElementById('save-btn');
const statusMsg      = document.getElementById('status-msg');

function populateModels(service, selectedModel) {
  modelSelect.innerHTML = '';
  (MODELS[service] || []).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = m.label;
    if (m.value === selectedModel) opt.selected = true;
    modelSelect.appendChild(opt);
  });
}

serviceSelect.addEventListener('change', () => {
  populateModels(serviceSelect.value, null);
});

tempSlider.addEventListener('input', () => {
  tempDisplay.textContent = parseFloat(tempSlider.value).toFixed(2);
});

toggleKeyBtn.addEventListener('click', () => {
  const isHidden = apiKeyInput.type === 'password';
  apiKeyInput.type = isHidden ? 'text' : 'password';
  toggleKeyBtn.textContent = isHidden ? '🙈' : '👁';
});

saveBtn.addEventListener('click', () => {
  const settings = {
    service:     serviceSelect.value,
    apiKey:      apiKeyInput.value.trim(),
    model:       modelSelect.value,
    temperature: parseFloat(tempSlider.value),
  };

  if (!settings.apiKey) {
    showStatus('Please enter an API key.', true);
    return;
  }

  chrome.storage.sync.set(settings, () => {
    showStatus('✓ Settings saved!', false);
  });
});

function showStatus(msg, isErr) {
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg' + (isErr ? ' err' : '');
  setTimeout(() => { statusMsg.textContent = ''; }, 3000);
}

// Load saved settings
chrome.storage.sync.get(
  { service: 'gemini', apiKey: '', model: 'gemini-2.5-flash', temperature: 0.85 },
  saved => {
    serviceSelect.value = saved.service;
    apiKeyInput.value   = saved.apiKey;
    tempSlider.value    = saved.temperature;
    tempDisplay.textContent = parseFloat(saved.temperature).toFixed(2);

    let activeModel = saved.model;
    if (!activeModel || activeModel.includes('1.5') || activeModel.includes('2.0')) {
      activeModel = 'gemini-2.5-flash';
      chrome.storage.sync.set({ model: 'gemini-2.5-flash' });
    }

    populateModels(saved.service, activeModel);
  }
);
