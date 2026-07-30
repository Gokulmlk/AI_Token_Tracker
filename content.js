(function() {
  'use strict';
  
  // Platform detection
  const hostname = window.location.hostname;
  const platformMap = {
    'chatgpt.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    'claude.ai': 'claude',
    'gemini.google.com': 'gemini',
    'perplexity.ai': 'perplexity',
    'copilot.microsoft.com': 'copilot',
    'chat.deepseek.com': 'deepseek',
    'grok.x.ai': 'grok',
    'x.ai': 'grok'
  };
  
  const platform = platformMap[hostname];
  if (!platform) return;
  
  // Token estimation ratios (chars per token, approximate)
  const ratios = {
    chatgpt: 3.8,
    claude: 3.5,
    gemini: 3.7,
    perplexity: 3.8,
    copilot: 3.8,
    deepseek: 3.5,
    grok: 3.8
  };
  
  function estimateTokens(text) {
    if (!text) return 0;
    const ratio = ratios[platform] || 4.0;
    return Math.ceil(text.length / ratio);
  }
  
  // Platform-specific DOM selectors for messages
  const selectors = {
    chatgpt: {
      user: '[data-testid="user-message"], .text-message[data-message-author-role="user"]',
      assistant: '[data-testid="assistant-message"], .text-message[data-message-author-role="assistant"]'
    },
    claude: {
      user: '.font-user-message, [data-test-render-count] .whitespace-pre-wrap',
      assistant: '.font-claude-message, .prose'
    },
    gemini: {
      user: '.user-query, .query-content',
      assistant: '.response-content, .model-response-text'
    },
    perplexity: {
      user: '.user-message, [data-testid="user-turn"]',
      assistant: '.assistant-message, [data-testid="assistant-turn"]'
    },
    copilot: {
      user: '.user-content, .text-message-content',
      assistant: '.bot-content, .ac-textBlock'
    },
    deepseek: {
      user: '.user-message, [data-testid="user-message"]',
      assistant: '.assistant-message, .markdown-body'
    },
    grok: {
      user: '.user-message, [data-testid="user-message"]',
      assistant: '.assistant-message, .prose'
    }
  };
  
  let lastProcessedHash = '';
  let debounceTimer = null;
  
  function getMessageText(selector) {
    const elements = document.querySelectorAll(selector);
    let text = '';
    elements.forEach(el => {
      // Avoid counting the same text twice if nested
      text += ' ' + el.innerText;
    });
    return text.trim();
  }
  
  function scanAndReport() {
    const s = selectors[platform];
    if (!s) return;
    
    const userText = getMessageText(s.user);
    const assistantText = getMessageText(s.assistant);
    const combinedHash = userText.length + '-' + assistantText.length;
    
    if (combinedHash === lastProcessedHash) return;
    lastProcessedHash = combinedHash;
    
    const inputTokens = estimateTokens(userText);
    const outputTokens = estimateTokens(assistantText);
    
    // Only report if there's meaningful content
    if (inputTokens + outputTokens > 0) {
      chrome.runtime.sendMessage({
        type: 'TOKEN_UPDATE',
        platform,
        inputTokens,
        outputTokens
      }).catch(() => {});
    }
  }
  
  // Debounced observer callback
  function onDomChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanAndReport, 1500);
  }
  
  // Watch for DOM changes
  const observer = new MutationObserver(onDomChange);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Initial scan
  setTimeout(scanAndReport, 2000);
  
  // Also scan periodically as fallback
  setInterval(scanAndReport, 10000);
})();