# Privacy Policy for Brototype Helper AI

**Last updated:** November 16, 2026

Brototype Helper AI ("the Extension") is developed by **YTS Developments** as an assistive productivity tool for students using the Brototype Student Portal (`student.brototype.com`).

We are committed to user privacy. This document outlines how data and permissions are handled.

---

## 1. Zero Personal Data Collection

- The Extension does **not** collect, track, log, or transmit any personal information, browsing history, or user identity.
- There are **no** analytics libraries, tracking pixels, cookies, or remote telemetry embedded in the Extension.
- All operations are executed locally within the user's browser.

---

## 2. Local Configuration & Storage

- User preferences—including selected AI provider, preferred model, temperature tone setting, and API keys—are stored exclusively on the user's device using Chrome's native `chrome.storage.sync` API.
- API keys are stored in encrypted browser storage and are never sent to any third-party server or developer-controlled endpoint.

---

## 3. Direct API Communication

- When generating text descriptions or adjusting grammar, the Extension sends the topic text directly and securely over HTTPS to the official API endpoint of the provider chosen by the user:
  - **Google Gemini API:** `https://generativelanguage.googleapis.com`
  - **OpenAI API:** `https://api.openai.com`
  - **Anthropic Claude API:** `https://api.anthropic.com`
- These requests are made using the student's own API key. No intermediate proxy servers or third-party relays are used.

---

## 4. Permissions Usage

- **`storage`**: Used solely to persist provider preferences and API keys locally in the browser.
- **`activeTab`**: Used strictly to read module topic titles on the student portal and fill the generated description into the submission form upon user action.
- **`tabs`**: Used exclusively by the "Tasks ↗" shortcut button to detect if a portal tab is already open and redirect it rather than duplicating tabs.
- **Host Permissions (`student.brototype.com`)**: Required to inject the helper buttons (`Add` and `Quick Add`) on module task pages.
- **Host Permissions (`api.github.com`)**: Used solely to check the public releases endpoint to notify the user when an update is available.

---

## 5. Third-Party Code

The Extension does **not** load or execute remote scripts or dynamic code (`eval()`). All JavaScript, CSS, HTML, and assets are packaged and verified locally within the extension package.

---

## 6. Contact & Inquiries

For questions or feedback regarding this Privacy Policy, please contact:

- **Developer:** YTS Developments (Shidan)
- **Email:** `ytshidan50@gmail.com`
- **Website:** [https://shidan.mangmc.in/](https://shidan.mangmc.in/)
- **Repository:** [https://github.com/ytshidan50/BrototypeHelperAI](https://github.com/ytshidan50/BrototypeHelperAI)
