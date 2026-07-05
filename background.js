// ConsoleMind — Background Service Worker
// Stores errors in chrome.storage.local, updates badge, sends notifications

var KEY = 'cm_errors';

// Ensure storage key exists
chrome.runtime.onInstalled.addListener(function() { chrome.storage.local.set({ [KEY]: {} }); });
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.local.get(KEY, function(d) { if (!d[KEY]) chrome.storage.local.set({ [KEY]: {} }); });
});

chrome.runtime.onMessage.addListener(function(msg, sender, respond) {
  if (msg.action === 'capture' && sender.tab) {
    saveError(sender.tab.id, msg);
    respond({ ok: 1 });
    return false;
  }
  if (msg.action === 'get') {
    chrome.storage.local.get(KEY, function(d) {
      var s = d[KEY] || {};
      respond({ errors: s[String(msg.tabId)] || [] });
    });
    return true;
  }
  if (msg.action === 'clear') {
    chrome.storage.local.get(KEY, function(d) {
      var s = d[KEY] || {};
      s[String(msg.tabId)] = [];
      chrome.storage.local.set({ [KEY]: s }, function() {
        chrome.action.setBadgeText({ text: '', tabId: msg.tabId });
        respond({ ok: 1 });
      });
    });
    return true;
  }
  if (msg.action === 'webSearch') {
    var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(msg.query) + '&num=8';
    fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } })
      .then(function(r) { return r.text(); })
      .then(function(html) {
        // Parse Google results from HTML
        var results = [];
        var regex = /<a href="\/url\?q=([^&"]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
        var match;
        while ((match = regex.exec(html)) !== null && results.length < 8) {
          var url = decodeURIComponent(match[1]);
          if (url.startsWith('http') && !url.includes('google.com') && !url.includes('accounts.google')) {
            var titleHtml = match[2].replace(/<[^>]+>/g, '').trim();
            if (titleHtml) results.push({ url: url, title: titleHtml });
          }
        }
        // Also try to get snippets from <span> blocks
        var snippetRegex = /<span class="[^"]*">([^<]{40,200})<\/span>/g;
        var si = 0;
        while ((match = snippetRegex.exec(html)) !== null && si < results.length) {
          if (match[1].length > 40) { results[si].snippet = match[1]; si++; }
        }
        respond({ results: results });
      })
      .catch(function(e) { respond({ results: [], error: e.message }); });
    return true;
  }
  if (msg.action === 'resolve') {
    chrome.storage.local.get(KEY, function(d) {
      var s = d[KEY] || {};
      var arr = s[String(msg.tabId)] || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === msg.errorId) { arr[i].resolved = true; break; }
      }
      chrome.storage.local.set({ [KEY]: s }, function() { respond({ ok: 1 }); });
    });
    return true;
  }
  if (msg.action === 'ignore') {
    chrome.storage.local.get(KEY, function(d) {
      var s = d[KEY] || {};
      var arr = s[String(msg.tabId)] || [];
      s[String(msg.tabId)] = arr.filter(function(e) { return e.id !== msg.errorId; });
      chrome.storage.local.set({ [KEY]: s }, function() { respond({ ok: 1 }); });
    });
    return true;
  }
});

function saveError(tabId, msg) {
  chrome.storage.local.get(KEY, function(d) {
    var s = d[KEY] || {};
    var k = String(tabId);
    if (!s[k]) s[k] = [];
    var arr = s[k];

    // Dedup
    var norm = normalize(msg.msg);
    var found = null;
    for (var i = 0; i < arr.length; i++) {
      if (normalize(arr[i].message) === norm) { found = arr[i]; break; }
    }

    if (found) {
      found.count = (found.count || 1) + 1;
      found.lastSeen = msg.ts;
    } else {
      arr.push({
        id: uid(),
        level: msg.level,
        message: msg.msg,
        stack: msg.stack,
        url: msg.href,
        time: msg.ts,
        lastSeen: msg.ts,
        count: 1,
        resolved: false
      });
    }

    if (arr.length > 150) s[k] = arr.slice(-150);
    chrome.storage.local.set({ [KEY]: s });

    // Badge
    var n = 0;
    for (var j = 0; j < arr.length; j++) { if (arr[j].level === 'error' && !arr[j].resolved) n++; }
    chrome.action.setBadgeText({ text: n > 0 ? String(n) : '', tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#EF4444', tabId: tabId });

    // Spike detection — notify if 5+ errors in 10 seconds
    var now = Date.now();
    var recent = arr.filter(function(e) { return e.level === 'error' && (now - (e.lastSeen || e.time)) < 10000; });
    if (recent.length >= 5) {
      chrome.notifications.create('spike-' + tabId + '-' + now, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'ConsoleMind — Error Spike!',
        message: recent.length + ' errors in the last 10 seconds on this tab.',
        priority: 2
      });
    }
  });
}

function normalize(m) {
  return (m || '').replace(/\d{5,}/g, '#').replace(/'[^']*'/g, "'_'").replace(/"[^"]*"/g, '"_"').substring(0, 200);
}
function uid() { return Math.random().toString(36).substr(2, 10) + Date.now().toString(36); }

chrome.tabs.onRemoved.addListener(function(tabId) {
  chrome.storage.local.get(KEY, function(d) {
    var s = d[KEY] || {};
    delete s[String(tabId)];
    chrome.storage.local.set({ [KEY]: s });
  });
});
