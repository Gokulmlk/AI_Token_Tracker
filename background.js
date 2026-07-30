// Background service worker — handles installation and message passing
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    usage: {},
    limits: {
      chatgpt: 40000,      // GPT-4o mini free tier approx
      claude: 30000,       // Claude free tier approx
      gemini: 60000,       // Gemini 1.5 Flash free tier approx
      perplexity: 5000,    // Perplexity free approx
      copilot: 4000,       // Copilot free approx
      deepseek: 50000,     // DeepSeek V3 free approx
      grok: 25000          // Grok free approx
    },
    lastReset: new Date().toDateString()
  });
});

// Check for day rollover and reset if needed
chrome.runtime.onStartup.addListener(checkDayReset);
chrome.alarms?.create('dailyReset', { periodInMinutes: 60 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') checkDayReset();
});

function checkDayReset() {
  const today = new Date().toDateString();
  chrome.storage.local.get(['lastReset'], (result) => {
    if (result.lastReset !== today) {
      chrome.storage.local.set({
        usage: {},
        lastReset: today
      });
    }
  });
}

// Listen for token updates from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOKEN_UPDATE') {
    const { platform, inputTokens, outputTokens } = request;
    const totalTokens = inputTokens + outputTokens;
    
    chrome.storage.local.get(['usage'], (result) => {
      const usage = result.usage || {};
      usage[platform] = (usage[platform] || 0) + totalTokens;
      chrome.storage.local.set({ usage }, () => {
        // Update badge with percentage
        chrome.storage.local.get(['limits'], (res) => {
          const limit = res.limits?.[platform] || 100000;
          const percent = Math.min(100, Math.round((usage[platform] / limit) * 100));
          const badgeText = percent >= 100 ? '!' : percent > 0 ? percent + '%' : '';
          
          if (sender.tab?.id) {
            chrome.action.setBadgeText({ text: badgeText, tabId: sender.tab.id });
            chrome.action.setBadgeBackgroundColor({ 
              color: percent >= 90 ? '#ef4444' : percent >= 70 ? '#f59e0b' : '#10b981' 
            });
          }
        });
      });
    });
    sendResponse({ success: true });
  }
  return true;
});