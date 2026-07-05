// ConsoleMind — Content Script (ISOLATED world)
// Bridges MAIN world postMessage to background service worker
window.addEventListener('message', function(ev) {
  if (!ev.data || !ev.data.__cm) return;
  try {
    chrome.runtime.sendMessage({
      action: 'capture',
      level: ev.data.level,
      msg: ev.data.msg,
      stack: ev.data.stack || '',
      href: ev.data.href || location.href,
      ts: ev.data.ts || Date.now()
    }, function() { void chrome.runtime.lastError; });
  } catch(e) {}
});
