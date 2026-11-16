# ✨ Brototype Helper AI

> An intelligent, productivity-focused browser assistant built for students on the Brototype Student Portal ([student.brototype.com](https://student.brototype.com/)).

---

## 📌 Purpose & Architecture

**Brototype Helper AI** is designed as a generalized companion suite for the Brototype student journey. While it currently provides seamless automation for routine documentation and task submissions ([student.brototype.com/tasks/module](https://student.brototype.com/tasks/module)), its architecture is built to support a wide range of future student utilities.

In fast-paced, intensive software engineering programs like Brototype, consistent documentation and submission of module learnings are vital daily habits. Today, many students naturally leverage modern AI assistants to help summarize their understanding and format clear, structured submission notes. 

However, the manual cycle—switching tabs, prompting an LLM, copying text, returning to the portal, expanding accordion topics, opening attachment dialogs, selecting text options, and pasting—creates significant mechanical overhead. 

The task description feature solves this workflow friction by providing a direct bridge between your preferred AI model and portal forms, saving time on repetitive submission busywork so you can invest your energy into hands-on coding and core software architecture.

---

## ⚠️ Important Academic Guidance & Student Notice

> [!IMPORTANT]
> **Please read before using this tool:**
>
> 1. **Metadata vs. Actual Mastery:** The written descriptions submitted on the portal serve merely as organizational topic records. In the Brototype curriculum, passing evaluations, weekly technical reviews, 1-on-1 advisor vivas, and coding assessments depends **100% on your genuine understanding of the concepts and your ability to write, debug, and explain your code independently**.
> 2. **No Substitute for Practical Implementation:** An AI-generated summary cannot build your projects, debug your code, or answer critical architectural questions during technical interviews. Real engineering skills are forged by struggling through code, reading documentation, and building real-world applications.
> 3. **Active Learning Encouraged:** We strongly recommend reviewing, reading through, and refining any generated notes. Use them as reference summaries to reinforce what you learned during your study sessions. Ensure you complete all accompanying coding tasks, personal projects, and core exercises with thorough diligence.

---

## 🚀 Key Features

- **⚡ Quick Add:** Located directly alongside each topic heading and attachment count. With a single click, it auto-expands the card, generates a contextual, first-person student summary, selects the "Text" attachment type, titles it "Description", and submits it into your portal in under 3 seconds.
- **👁️ Add (Review & Edit Modal):** Want to review or fine-tune before submitting? Click `Add` to open the preview modal, where you can modify the text or use the **✏️ Fix Grammar** feature.
- **🎛️ Mini Control Center (Popup):** Full configuration toolbar right from your browser extensions icon.
  - **Home Tab:** Dynamic model selector per provider and a tone/temperature slider (`0.5` concise to `1.1` natural phrasing).
  - **Manage Tab:** Add, update, delete, or switch between Google Gemini, OpenAI, or Claude with masked API key security.
  - **Tasks ↗ Shortcut:** Instantly switches or navigates straight to [student.brototype.com/tasks/module](https://student.brototype.com/tasks/module).
- **🔄 Auto-Update Listener:** Built-in listener checks GitHub releases on launch and shows an update notification banner with a direct download link when a new release is available.
- **💸 100% Free Forever:** Out-of-the-box support for **Google Gemini 2.5 Flash** using free API keys from Google AI Studio (zero billing or credit card required).

---

## 📦 Installation & Setup

### Method 1: Automated 1-Click Installer (Recommended)
1. Download `install.bat` from the latest [GitHub Release](https://github.com/ytshidan/Brototype-Helper-AI/releases).
2. Double-click **`install.bat`** — it automatically sets up the extension in a permanent local folder (`%LOCALAPPDATA%\BrototypeHelperAI`) and opens your extensions page.
3. In Chrome, click **Load unpacked** and select the folder opened by the installer.

---

### Method 2: Manual Unpack from Releases
1. Download **`Brototype-Helper-AI-v1.4.0.zip`** from [GitHub Releases](https://github.com/ytshidan/Brototype-Helper-AI/releases).
2. Extract the `.zip` archive into any folder on your computer.
3. Open your browser to `chrome://extensions/` (or `edge://extensions/`).
4. Enable **Developer mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the extracted folder.

---

### Step 3: Add Your Free Gemini API Key (Takes 10 Seconds)
1. Click the puzzle icon 🧩 in Chrome's top toolbar, find **Brototype Helper AI**, and pin it.
2. Click the extension icon → navigate to the **Manage** tab.
3. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and click **Create API Key** (completely free, zero billing setup required).
4. Paste your key into the extension and click **➕ Add Provider**.

---

## 🔒 Privacy & Security

- **Direct HTTPS Requests:** API keys and prompts communicate directly from your browser to Google AI / OpenAI / Anthropic APIs over encrypted HTTPS.
- **Zero Third-Party Relays:** No tracking servers, telemetry, or remote databases. Everything is stored locally in your browser's `chrome.storage.sync`.

---

## 👨‍💻 Author & Credits

Designed and maintained by **[YTS Developments](https://shidan.mangmc.in/)**.  
Portfolio & Contact: [https://shidan.mangmc.in/](https://shidan.mangmc.in/)
