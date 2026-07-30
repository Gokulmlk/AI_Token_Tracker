const platformInfo = {
  chatgpt: { name: 'ChatGPT', icon: '💬', color: '#10a37f' },
  claude: { name: 'Claude', icon: '🟣', color: '#cc785c' },
  gemini: { name: 'Gemini', icon: '♊', color: '#4285f4' },
  perplexity: { name: 'Perplexity', icon: '🔍', color: '#22d3ee' },
  copilot: { name: 'Copilot', icon: '✈️', color: '#0ea5e9' },
  deepseek: { name: 'DeepSeek', icon: '🐋', color: '#4f46e5' },
  grok: { name: 'Grok', icon: '🚀', color: '#f97316' }
};

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function render() {
  chrome.storage.local.get(['usage', 'limits', 'lastReset'], (result) => {
    const usage = result.usage || {};
    const limits = result.limits || {};
    const container = document.getElementById('platforms-container');
    const dateEl = document.getElementById('current-date');
    
    dateEl.textContent = result.lastReset || new Date().toDateString();
    container.innerHTML = '';
    
    Object.keys(platformInfo).forEach(key => {
      const info = platformInfo[key];
      const used = usage[key] || 0;
      const limit = limits[key] || 100000;
      const percent = Math.min(100, (used / limit) * 100);
      
      const card = document.createElement('div');
      card.className = 'platform-card';
      
      let barColor = '#10b981';
      if (percent >= 90) barColor = '#ef4444';
      else if (percent >= 70) barColor = '#f59e0b';
      
      let warning = '';
      if (percent >= 100) {
        warning = '<div class="warning danger">⚠️ Limit reached!</div>';
      } else if (percent >= 90) {
        warning = '<div class="warning danger">🔴 90% used — slow down!</div>';
      } else if (percent >= 70) {
        warning = '<div class="warning warn">🟡 70% used</div>';
      }
      
      card.innerHTML = `
        <div class="platform-header">
          <div class="platform-name">
            <span class="platform-icon" style="background:${info.color}20;color:${info.color}">
              ${info.icon}
            </span>
            ${info.name}
          </div>
          <div class="token-count">
            ${formatNumber(used)} <span class="token-limit">/ ${formatNumber(limit)}</span>
          </div>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:${percent}%;background:${barColor}"></div>
        </div>
        ${warning}
      `;
      
      container.appendChild(card);
    });
  });
}

// Settings toggle
let settingsOpen = false;
document.getElementById('settings-btn').addEventListener('click', () => {
  const container = document.getElementById('platforms-container');
  
  if (settingsOpen) {
    render(); // back to normal view
    settingsOpen = false;
    document.getElementById('settings-btn').textContent = 'Edit Limits';
    return;
  }
  
  settingsOpen = true;
  document.getElementById('settings-btn').textContent = 'Back to Stats';
  
  chrome.storage.local.get(['limits'], (result) => {
    const limits = result.limits || {};
    let html = '<div class="settings-panel">';
    
    Object.keys(platformInfo).forEach(key => {
      const info = platformInfo[key];
      html += `
        <div class="limit-row">
          <label>${info.icon} ${info.name} daily limit</label>
          <input type="number" class="limit-input" data-platform="${key}" 
                 value="${limits[key] || 0}" min="0" step="1000">
        </div>
      `;
    });
    
    html += '<button id="save-limits" class="save-btn">Save Limits</button></div>';
    container.innerHTML = html;
    
    document.getElementById('save-limits').addEventListener('click', () => {
      const inputs = document.querySelectorAll('.limit-input');
      const newLimits = {};
      inputs.forEach(input => {
        newLimits[input.dataset.platform] = parseInt(input.value) || 0;
      });
      chrome.storage.local.set({ limits: newLimits }, () => {
        render();
        settingsOpen = false;
        document.getElementById('settings-btn').textContent = 'Edit Limits';
      });
    });
  });
});

// Initial render
render();