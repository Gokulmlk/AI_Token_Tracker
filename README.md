# 🤖 AI Token Tracker
A lightweight, privacy-first browser extension that estimates your daily token usage across major AI chat platforms. Built for users on free tiers who want to stay within their limits — no API keys, no backend, 100% offline.

### ✨ Features
- 🔍 Auto-detects which AI tool you're using on the current tab
- 📊 Estimates tokens in your prompts and AI responses in real time
- 📅 Tracks daily usage with visual progress bars per platform
- 🚨 Warns you when you're approaching your free-tier limit (70%, 90%, 100%)
- 🔒 Zero data collection — everything stays in your browser's local storage
- 🌐 Cross-browser — works on Chrome, Edge, Brave, Opera, and Firefox
- ⚙️ Customizable limits — edit daily caps directly in the popup
- 🛠️ Supported Platforms

```
| Platform                | Free Tier Default  | Status      |
| ----------------------- | ------------------ | ----------- |
| **ChatGPT** (OpenAI)    | ~40,000 tokens/day | ✅ Supported |
| **Claude** (Anthropic)  | ~30,000 tokens/day | ✅ Supported |
| **Gemini** (Google)     | ~60,000 tokens/day | ✅ Supported |
| **Perplexity**          | ~5,000 tokens/day  | ✅ Supported |
| **Copilot** (Microsoft) | ~4,000 tokens/day  | ✅ Supported |
| **DeepSeek**            | ~50,000 tokens/day | ✅ Supported |
| **Grok** (xAI)          | ~25,000 tokens/day | ✅ Supported |

```
#### ⚠️ Note: Default limits are rough estimates. Actual free-tier caps vary by account type, region, and provider policy. Always verify and adjust limits to match your account.

## 📦 Installation

### Chrome / Edge / Brave / Opera
1. Download or clone this repository.
2. Open your browser and navigate to the extensions page:
- Chrome: chrome://extensions
- Edge: edge://extensions
- Brave: brave://extensions
- Opera: opera://extensions
3. Enable Developer mode using the toggle in the top-right corner.
4. Click Load unpacked and select the extension folder.
5. Pin the extension to your toolbar for quick access.

## Firefox
### Firefox requires Manifest V2. Use the manifest-firefox.json file (rename it to manifest.json before loading):
1. Download or clone this repository.
2. Rename manifest-firefox.json to manifest.json.
3. Open Firefox and go to about:debugging.
4. Click This Firefox → Load Temporary Add-on...
5. Select the manifest.json file inside the extension folder.
```
💡 For a permanent Firefox install, you'll need to package it as an .xpi or submit it to addons.mozilla.org.
```
### 🚀 How to Use
1. Open any supported AI platform (e.g., chatgpt.com, claude.ai).
2. Chat normally. The extension automatically detects your messages and the AI's responses.
3. Click the extension icon in your browser toolbar to see:
   - Estimated tokens used today per platform
   - Progress bar showing usage against your limit
   - Color-coded warnings (green → yellow → red)
4. Edit your limits by clicking "Edit Limits" in the popup if your account has different caps.
   
## 📁 File Structure
```
plain
ai-token-tracker/
├── manifest.json              # Chrome/Edge/Brave/Opera manifest (MV3)
├── manifest-firefox.json      # Firefox manifest (MV2)
├── background.js              # Service worker — storage, daily reset, badge updates
├── content.js                 # Injected script — DOM scraping & token estimation
├── popup.html                 # Extension popup UI
├── popup.js                   # Popup logic & settings panel
├── popup.css                  # Popup styling
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
## 🔬 How Token Estimation Works
This extension does not use official tokenizers (like OpenAI's tiktoken) because they require large dictionary files and would hurt performance. Instead, it uses character-to-token ratios calibrated per platform:
Table
Platform	Approx. Chars per Token
ChatGPT	3.8
Claude	3.5
Gemini	3.7
Perplexity	3.8
Copilot	3.8
DeepSeek	3.5
Grok	3.8
Formula: estimated_tokens = ceil(text_length / ratio)
This method is accurate within ±10–20% for English text and works entirely offline.
⚙️ Customization
Editing Daily Limits
Click the extension icon.
Click "Edit Limits" at the bottom.
Adjust the number for each platform.
Click "Save Limits".
Your settings are stored locally in chrome.storage.local / browser.storage.local.
Resetting Usage
Usage data automatically resets at midnight based on your local system time. You can also manually clear data by:
Going to your browser's Extension Storage settings, or
Reinstalling the extension.
⚠️ Important Caveats
Estimates, not exact counts. Real tokenization depends on the model's specific tokenizer (BPE, SentencePiece, etc.). This extension provides a close approximation for budgeting purposes only.
DOM selectors may break. If an AI platform redesigns its UI, the extension may temporarily stop detecting messages until the selectors are updated.
Free-tier limits change. AI providers frequently adjust their free-tier policies. Always double-check your actual account limits.
No API interception. This extension reads visible page text only. It cannot intercept encrypted API traffic or measure tokens that never render on screen.
Multi-language variance. Token ratios assume primarily English text. CJK (Chinese, Japanese, Korean) and other scripts may have significantly different token-per-character rates.
🔧 Updating Broken Selectors
If a platform updates its UI and the extension stops counting:
Open the AI platform in your browser.
Press F12 to open DevTools → Elements tab.
Inspect a user message and an AI response.
Note the CSS classes or data-testid attributes.
Open content.js and update the selectors object for that platform.
Reload the extension in chrome://extensions.
🛡️ Privacy
No network requests are made by this extension.
No data leaves your browser. All usage stats are stored in chrome.storage.local.
No permissions to read cookies, passwords, or browsing history beyond the supported AI domains.
📝 License
This project is released under the MIT License. Feel free to fork, modify, and distribute.
🙋 FAQ
Q: Why doesn't it show exact tokens like the API does?
A: Official tokenizers require ~1MB+ of vocabulary data. This extension prioritizes speed and zero dependencies by using mathematical estimation.
Q: Can I use this on mobile browsers?
A: Mobile Chrome/Firefox don't support extensions on Android/iOS. You'd need Kiwi Browser (Android) or Firefox Nightly with custom add-on collections.
Q: Will this get me banned from AI platforms?
A: No. It only reads text already visible on your screen. It does not automate clicks, send extra requests, or violate Terms of Service.
Q: Can you add [X] platform?
A: Open an issue or PR! You mainly need to add a domain match in manifest.json and a selector entry in content.js.
