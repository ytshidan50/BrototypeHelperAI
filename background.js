// Background service worker — handles AI API calls

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE') {
    handleGenerate(message.payload)
      .then(result => {
        sendResponse({ success: true, text: result });
      })
      .catch(err => {
        console.log('[BAI] Generation notice:', err?.message || err);
        sendResponse({ success: false, error: err?.message || String(err) });
      });
    return true; // keep channel open for async response
  }
});

async function handleGenerate({ service, apiKey, model, topicTitle, fullDescription, mode, currentText, temperature }) {
  const prompt = buildPrompt(topicTitle, fullDescription, mode, currentText);
  const temp = typeof temperature === 'number' ? temperature : 0.75;

  switch (service) {
    case 'openai':
      return callOpenAI(apiKey, model, prompt, temp);
    case 'gemini':
      return callGemini(apiKey, model, prompt, temp);
    case 'anthropic':
      return callAnthropic(apiKey, model, prompt, temp);
    default:
      throw new Error('Unknown AI service: ' + service);
  }
}

function buildPrompt(topicTitle, fullDescription, mode, currentText) {
  if (mode === 'grammar') {
    return `You are a writing assistant. A student wrote this response for their learning portal:

"${currentText}"

Rewrite it with corrected grammar, clear sentence structure, and natural phrasing. Keep the first-person student tone and the same core meaning. Do not add unnecessary fluff. Output only the final corrected text.`;
  }

  return `You are writing a short task description on behalf of a student for their course portal submission.

Topic / Task Title:
"${topicTitle}"

Full Task Details & Covered Topics:
"""
${fullDescription || topicTitle}
"""

Instructions:
1. Write 2 to 4 concise sentences in first person ("I ..."), as the student who just completed studying or working on this specific task.
2. Directly mention 1 to 2 key concepts, tools, libraries, book takeaways, or exercises from the details above so the response is 100% relevant and specific.
3. Sound authentic, natural, and human — avoid robotic clichés like "In this module, I embarked on a journey" or "I am thrilled to announce".
4. Do NOT use bullet points, headers, quotation marks around the text, or conversational intros like "Here is your description".
5. Output ONLY the description text.`;
}

// ── Google Gemini (Fast Direct generateContent with Model Fallback) ───────────
let cachedGeminiModels = null;
let lastModelFetch = 0;

async function getAvailableGeminiModels(apiKey) {
  const now = Date.now();
  if (cachedGeminiModels && (now - lastModelFetch < 300000)) {
    return cachedGeminiModels;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const valid = data.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace(/^models\//, ''))
          .filter(name => !name.includes('1.5') && !name.includes('2.0') && !name.includes('embedding') && !name.includes('imagen') && !name.includes('aqa'));

        if (valid.length > 0) {
          valid.sort((a, b) => {
            const aFlash = a.includes('flash') ? 1 : 0;
            const bFlash = b.includes('flash') ? 1 : 0;
            return bFlash - aFlash;
          });
          cachedGeminiModels = valid;
          lastModelFetch = now;
          return valid;
        }
      }
    }
  } catch (e) {
    clearTimeout(timer);
    console.log('[BAI] Model list notice:', e.message);
  }

  return ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-pro'];
}

async function callGemini(apiKey, requestedModel, prompt, temp = 0.75) {
  const availableModels = await getAvailableGeminiModels(apiKey);
  const cleanReq = (requestedModel || '').replace(/^models\//, '');

  const modelChain = [];
  if (cleanReq && !cleanReq.includes('1.5') && !cleanReq.includes('2.0')) {
    modelChain.push(cleanReq);
  }
  availableModels.forEach(m => {
    if (!modelChain.includes(m)) modelChain.push(m);
  });

  let lastError = null;

  for (let i = 0; i < modelChain.length; i++) {
    const currentModel = modelChain[i];
    try {
      console.log(`[BAI] Calling Gemini model: ${currentModel}...`);
      const result = await fetchGeminiGenerateContent(apiKey, currentModel, prompt, temp);
      if (result) return result;
    } catch (err) {
      lastError = err;
      const errMsg = (err.message || '').toLowerCase();

      // If invalid API key, fail immediately
      if (errMsg.includes('api key') || errMsg.includes('invalid_argument')) {
        throw err;
      }

      console.log(`[BAI] Model ${currentModel} notice: ${err.message}. Trying next available model...`);
    }
  }

  throw lastError || new Error('Gemini service is temporarily busy. Please retry in a few moments.');
}

// Direct generateContent API with fast low-latency config & fallback
async function fetchGeminiGenerateContent(apiKey, modelId, prompt, temp = 0.75) {
  const cleanId = modelId.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanId}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  // Set thinkingBudget: 0 to disable thinking overhead for sub-second responses on Flash models
  const bodyFast = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temp || 0.75,
      maxOutputTokens: 300,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  try {
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(bodyFast),
    });

    // If model does not support thinkingConfig, immediately retry without it
    if (!res.ok && res.status === 400) {
      const errPeek = await res.clone().json().catch(() => ({}));
      const msg = errPeek?.error?.message || '';
      if (msg.includes('thinkingConfig') || msg.includes('unknown field') || msg.includes('thinkingBudget')) {
        const bodyStandard = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: temp || 0.75,
            maxOutputTokens: 300,
          },
        };
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(bodyStandard),
        });
      }
    }

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.error?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts) {
      throw new Error('Empty response from model.');
    }

    // Filter out internal thinking tokens, extract real output text
    const parts = candidate.content.parts;
    const textParts = parts
      .filter(p => !p.thought && typeof p.text === 'string')
      .map(p => p.text);

    const result = textParts.join('').trim() || parts[0]?.text?.trim();
    if (!result) {
      throw new Error('Gemini response did not contain text.');
    }

    return result;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Model ${cleanId} timed out (8s).`);
    }
    throw err;
  }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────
async function callOpenAI(apiKey, model, prompt, temp = 0.75) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: typeof temp === 'number' ? temp : 0.75,
        max_tokens: 250,
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('OpenAI returned an empty response.');
    }
    return text;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('OpenAI request timed out (20s). Please retry.');
    }
    throw err;
  }
}

// ── Anthropic Claude ──────────────────────────────────────────────────────────
async function callAnthropic(apiKey, model, prompt, temp = 0.75) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 250,
        temperature: typeof temp === 'number' ? temp : 0.75,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic error ${res.status}`);
    }

    const data = await res.json();
    const textBlock = data.content?.find(c => c.type === 'text') || data.content?.[0];
    const text = textBlock?.text?.trim();
    if (!text) {
      throw new Error('Anthropic returned an empty response.');
    }
    return text;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Anthropic request timed out (20s). Please retry.');
    }
    throw err;
  }
}
