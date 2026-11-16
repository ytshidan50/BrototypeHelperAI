# ✨ Brototype Helper AI

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://github.com/ytshidan50/BrototypeHelperAI/releases)
[![Platform](https://img.shields.io/badge/platform-Edge%20%7C%20Chrome%20%7C%20Brave-green.svg)](https://student.brototype.com/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Maintained by YTS Developments](https://img.shields.io/badge/author-YTS%20Developments-orange.svg)](https://shidan.mangmc.in/)

> An intelligent, workflow-focused browser companion built specifically for students navigating the [Brototype Student Portal](https://student.brototype.com/).

---

## 📌 Mission & Architecture

**Brototype Helper AI** was engineered as an assistive productivity suite for aspiring software engineers. In intensive developer programs like Brototype, consistent documentation and submission of learning logs across module tasks ([student.brototype.com/tasks/module](https://student.brototype.com/tasks/module)) are vital daily routines.

While modern students routinely consult AI models to summarize core technical takeaways, the mechanical overhead of toggling browser tabs, copying text, expanding nested accordion panels, opening dialogs, and formatting inputs introduces repetitive friction. 

**Brototype Helper AI** automates this mechanical busywork through a direct browser integration. It bridges your chosen AI provider with the portal interface so you can complete submission paperwork in seconds and preserve your mental energy for core programming, algorithm design, and building real-world software.

---

## ⚠️ Academic Guidance & Student Notice

> [!IMPORTANT]
> **Please read before using this tool:**
>
> 1. **Documentation Metadata vs. Technical Mastery:** Descriptions submitted on the portal serve strictly as organizational records of completed study topics. In the Brototype curriculum, evaluation success in weekly technical reviews, 1-on-1 advisor vivas, machine tasks, and project assessments depends **100% on your conceptual understanding, problem-solving capability, and ability to write, debug, and explain your code independently**.
> 2. **Practical Coding is Irreplaceable:** An AI-generated summary cannot construct your project architecture, resolve runtime exceptions, or defend design decisions during a technical review. Engineering acumen is forged through active hands-on coding and reading documentation.
> 3. **Active Engagement:** We encourage every student to review generated summaries, customize their notes, and ensure all accompanying programming exercises, daily workouts, and modular projects are completed thoroughly and independently.

---

## 🚀 Key Features

- **⚡ Quick Add:** Located directly alongside each topic title and attachment counter. A single click auto-expands the card, generates a contextual, first-person summary, selects the "Text" attachment type, labels it "Description", and submits it into your portal in under 3 seconds.
- **👁️ Add (Review & Edit Modal):** Want to review or refine before submitting? Click `Add` to open the preview modal, where you can modify the text, adjust phrasing, or use the **✏️ Fix Grammar** utility.
- **🎛️ Mini Control Center (Popup):**
  - **Home Tab:** Active provider selector, dynamic model dropdown, and tone/temperature slider (`0.5` concise to `1.1` natural conversational).
  - **Manage Tab:** Configure Google Gemini, OpenAI, or Claude with masked API keys.
  - **Tasks ↗ Shortcut:** Instant one-click tab switch or navigation directly to [student.brototype.com/tasks/module](https://student.brototype.com/tasks/module).
- **🔄 Auto-Update Listener:** Built-in listener checks GitHub releases on launch and shows an update notification banner with a direct download link whenever a new release is published.
- **💸 100% Free Forever:** Out-of-the-box support for **Google Gemini 2.5 Flash** using free API keys from Google AI Studio (zero credit card or billing setup required).

---

## 📦 Installation Guide

Choose the installation method suited to your browser:

### Option A: Microsoft Edge (1-Click Official Store Install)
*Recommended for Microsoft Edge users — installs in 1 click with zero developer mode and automatic background updates.*

1. Visit the [Microsoft Edge Add-ons Listing](https://microsoftedge.microsoft.com/addons/detail/brototype-helper-ai) *(coming soon / pending certification)*.
2. Click **Get** → **Add extension**.
3. The extension is installed and ready immediately!

---

### Option B: Google Chrome & Brave (Automated Installer)
*Recommended for Google Chrome and Brave users — installs directly to `C:\BrototypeHelperAI`.*

**Method 1: Safe 1-Line PowerShell Command (Zero Security Warnings)**
Open PowerShell and run:
```powershell
irm https://raw.githubusercontent.com/ytshidan50/BrototypeHelperAI/main/install.ps1 | iex
```

**Method 2: Run `install.bat`**
1. Download **`install.bat`** from the latest [GitHub Release](https://github.com/ytshidan50/BrototypeHelperAI/releases).
2. Double-click **`install.bat`**.  
   *(If Windows SmartScreen shows a prompt, click **More info** → **Run anyway**).*
3. In Chrome, enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select `C:\BrototypeHelperAI` (or just press `Ctrl + V` and hit Enter!).
5. **Future Updates:** Run **`update.bat`** anytime to pull the newest update in place, then click the reload icon 🔄 in Chrome!

---

### Option C: Manual Unpack from Releases (Any Chromium Browser)
1. Download **`Brototype-Helper-AI-Store.zip`** from [GitHub Releases](https://github.com/ytshidan50/BrototypeHelperAI/releases).
2. Extract the `.zip` archive into a permanent folder on your computer.
3. Navigate to `chrome://extensions/` or `edge://extensions/`.
4. Enable **Developer mode** (top-right).
5. Click **Load unpacked** and select the unzipped directory.

---

## 🔑 Free API Key Setup (10 Seconds)

1. Click the puzzle icon 🧩 in your browser toolbar, find **Brototype Helper AI**, and pin it.
2. Click the extension icon → go to the **Manage** tab.
3. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and click **Create API Key** (100% free, no credit card required).
4. Paste your key into the extension and click **➕ Add Provider**.
5. Switch to the **Home** tab to choose your model and adjust your preferred tone.

---

## 🔒 Privacy & Local Security

- **Direct End-to-End Encryption:** Prompts and API requests communicate directly from your browser to Google / OpenAI / Anthropic official API servers via HTTPS.
- **Zero Third-Party Telemetry:** No user analytics, intermediary servers, tracking beacons, or external databases. All credentials and configurations remain strictly inside your browser's private `chrome.storage.sync`.

---

## 👨‍💻 Author & Attribution

Developed with care by **[YTS Developments](https://shidan.mangmc.in/)**.  
Portfolio & Contact: [https://shidan.mangmc.in/](https://shidan.mangmc.in/)
