// ConsoleMind AI — Advanced Features Module
// Adds: Error DNA, Health Score, Dependency Chain, Regression Detection,
// Cross-Tab Dashboard, Natural Language Queries, Error Prediction
// This file is loaded AFTER popup-app.js and extends functionality without modifying it.

(function() {
'use strict';

// ========== 1. ERROR DNA FINGERPRINTING ==========
// Track errors across page navigations and sessions
var DNA_KEY = 'cm_error_dna';

function getErrorFingerprint(msg) {
  return (msg || '').replace(/\d+/g, '#').replace(/https?:\/\/\S+/g, 'URL').substring(0, 100);
}

function trackErrorDNA(err) {
  if (!err || !err.message) return;
  var fp = getErrorFingerprint(err.message);
  chrome.storage.local.get(DNA_KEY, function(d) {
    var dna = d[DNA_KEY] || {};
    if (!dna[fp]) {
      dna[fp] = { firstSeen: Date.now(), pages: [], count: 0, message: err.message.substring(0, 100) };
    }
    dna[fp].count++;
    dna[fp].lastSeen = Date.now();
    var page = (err.url || location.href).replace(/[?#].*/,'');
    if (dna[fp].pages.indexOf(page) === -1) dna[fp].pages.push(page);
    // Keep max 200 fingerprints
    var keys = Object.keys(dna);
    if (keys.length > 200) {
      var oldest = keys.sort(function(a,b) { return (dna[a].lastSeen||0) - (dna[b].lastSeen||0); });
      delete dna[oldest[0]];
    }
    chrome.storage.local.set({ [DNA_KEY]: dna });
  });
}

function getErrorDNA(err, cb) {
  if (!err || !err.message) { cb(null); return; }
  var fp = getErrorFingerprint(err.message);
  chrome.storage.local.get(DNA_KEY, function(d) {
    var dna = d[DNA_KEY] || {};
    cb(dna[fp] || null);
  });
}

// ========== 2. ERROR HEALTH SCORE ==========
function calculateHealthScore(errors) {
  if (!errors || errors.length === 0) return 100;
  var score = 100;
  var errorCount = 0, warnCount = 0;
  for (var i = 0; i < errors.length; i++) {
    if (errors[i].level === 'error') errorCount++;
    else warnCount++;
  }
  score -= errorCount * 5;
  score -= warnCount * 1;
  // Critical errors penalize more
  for (var j = 0; j < errors.length; j++) {
    var msg = errors[j].message || '';
    if (msg.indexOf('Maximum call stack') !== -1 || msg.indexOf('Too many re-renders') !== -1) score -= 10;
    if (msg.indexOf('CORS') !== -1 || msg.indexOf('500') !== -1) score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

function getHealthColor(score) {
  if (score >= 80) return '#34d399';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

// ========== 3. ERROR DEPENDENCY CHAIN ==========
function buildDependencyChain(errors) {
  var chains = [];
  var sorted = errors.slice().sort(function(a,b) { return (a.time||0) - (b.time||0); });

  for (var i = 0; i < sorted.length; i++) {
    var err = sorted[i];
    var msg = err.message || '';

    // Look for causal patterns
    if (msg.indexOf('401') !== -1 || msg.indexOf('403') !== -1 || msg.indexOf('token') !== -1) {
      // Auth error — look for subsequent TypeErrors
      var chain = { root: err, caused: [] };
      for (var j = i + 1; j < Math.min(i + 10, sorted.length); j++) {
        var next = sorted[j];
        if ((next.time - err.time) < 5000) { // within 5 seconds
          if ((next.message || '').indexOf('undefined') !== -1 || (next.message || '').indexOf('null') !== -1) {
            chain.caused.push(next);
          }
        }
      }
      if (chain.caused.length > 0) chains.push(chain);
    }
  }
  return chains;
}

// ========== 4. ERROR REGRESSION DETECTION ==========
var REGRESSION_KEY = 'cm_known_errors';

function checkRegression(err, cb) {
  if (!err || !err.message) { cb(false); return; }
  var fp = getErrorFingerprint(err.message);
  chrome.storage.local.get(REGRESSION_KEY, function(d) {
    var known = d[REGRESSION_KEY] || {};
    var isNew = !known[fp];
    // Save as known
    known[fp] = { lastSeen: Date.now(), message: err.message.substring(0, 80) };
    // Keep max 300
    var keys = Object.keys(known);
    if (keys.length > 300) {
      var oldest = keys.sort(function(a,b) { return (known[a].lastSeen||0) - (known[b].lastSeen||0); });
      delete known[oldest[0]];
    }
    chrome.storage.local.set({ [REGRESSION_KEY]: known });
    cb(isNew);
  });
}

// ========== 5. NATURAL LANGUAGE QUERIES ==========
function processNaturalQuery(query, errors) {
  var q = query.toLowerCase();
  var results = [];

  if (q.indexOf('cors') !== -1) {
    results = errors.filter(function(e) { return (e.message||'').toLowerCase().indexOf('cors') !== -1; });
  } else if (q.indexOf('today') !== -1 || q.indexOf('recent') !== -1) {
    var today = new Date(); today.setHours(0,0,0,0);
    results = errors.filter(function(e) { return (e.time || e.lastSeen || 0) >= today.getTime(); });
  } else if (q.indexOf('critical') !== -1 || q.indexOf('severe') !== -1) {
    results = errors.filter(function(e) { return e.level === 'error'; });
  } else if (q.indexOf('warning') !== -1) {
    results = errors.filter(function(e) { return e.level === 'warning'; });
  } else if (q.indexOf('my code') !== -1 || q.indexOf('first-party') !== -1) {
    results = errors.filter(function(e) { return !(e.message||'').match(/chrome-extension|moz-extension|node_modules|cdn\.|googleapis/i); });
  } else if (q.indexOf('third-party') !== -1 || q.indexOf('3rd party') !== -1) {
    results = errors.filter(function(e) { return (e.message||'').match(/chrome-extension|moz-extension|node_modules|cdn\.|googleapis/i); });
  } else if (q.indexOf('react') !== -1) {
    results = errors.filter(function(e) { return (e.message||'').match(/react|hook|component|render|jsx/i); });
  } else if (q.indexOf('network') !== -1 || q.indexOf('fetch') !== -1 || q.indexOf('api') !== -1) {
    results = errors.filter(function(e) { return (e.message||'').match(/fetch|network|cors|timeout|ERR_|40[0-9]|50[0-9]/i); });
  } else if (q.indexOf('how many') !== -1 || q.indexOf('count') !== -1) {
    return { type: 'count', text: 'Total: ' + errors.length + ' (' + errors.filter(function(e){return e.level==='error';}).length + ' errors, ' + errors.filter(function(e){return e.level==='warning';}).length + ' warnings)' };
  } else if (q.indexOf('summary') !== -1 || q.indexOf('summarize') !== -1) {
    var types = {};
    errors.forEach(function(e) { var t = (e.message||'').split(':')[0]||'Unknown'; types[t] = (types[t]||0) + 1; });
    var summary = 'Error Summary:\n';
    Object.keys(types).sort(function(a,b){return types[b]-types[a];}).slice(0,5).forEach(function(t) { summary += '• ' + t + ': ' + types[t] + '\n'; });
    return { type: 'text', text: summary };
  }

  if (results.length > 0) {
    return { type: 'filtered', errors: results, text: 'Found ' + results.length + ' matching errors.' };
  }
  return null;
}

// ========== 6. ERROR PREDICTION ==========
function predictErrors(errors) {
  var predictions = [];
  for (var i = 0; i < errors.length; i++) {
    var msg = errors[i].message || '';
    if (msg.indexOf('401') !== -1 || msg.indexOf('token expired') !== -1 || msg.indexOf('Unauthorized') !== -1) {
      predictions.push({ icon: '⚠️', text: 'Auth token expired — components using user data will likely throw TypeErrors soon.' });
    }
    if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
      predictions.push({ icon: '🌐', text: 'Network requests failing — UI depending on this data may show blank or crash.' });
    }
    if (msg.indexOf('429') !== -1 || msg.indexOf('throttled') !== -1) {
      predictions.push({ icon: '🚦', text: 'Rate limited — subsequent API calls will likely fail too. Implement backoff.' });
    }
  }
  // Deduplicate
  var seen = {};
  return predictions.filter(function(p) { if (seen[p.text]) return false; seen[p.text] = true; return true; });
}

// ========== 7. RENDER ENHANCEMENTS INTO UI ==========

// Add health score to stats bar
function updateHealthScore() {
  var statsBar = document.getElementById('statsBar');
  if (!statsBar) return;
  var healthEl = document.getElementById('statHealth');
  if (!healthEl) {
    var span = document.createElement('span');
    span.innerHTML = '💚 Health: <b id="statHealth">--</b>';
    statsBar.appendChild(span);
    healthEl = document.getElementById('statHealth');
  }
  // Get errors from the list
  var items = document.querySelectorAll('.err-item');
  var errors = [];
  items.forEach(function(item) {
    var dot = item.querySelector('.ei-dot');
    errors.push({ level: dot && dot.classList.contains('error') ? 'error' : 'warning', message: item.querySelector('.ei-msg')?.textContent || '' });
  });
  var score = calculateHealthScore(errors);
  healthEl.textContent = score + '/100';
  healthEl.style.color = getHealthColor(score);
}

// Add Error DNA info to detail panel when an error is selected
function showDNAInDetail() {
  var detail = document.getElementById('detail');
  if (!detail) return;
  // Find selected error message from detail
  var msgEl = detail.querySelector('.d-msg');
  if (!msgEl) return;
  var msg = msgEl.textContent;
  if (!msg) return;

  getErrorDNA({ message: msg }, function(dna) {
    if (!dna || dna.pages.length <= 1) return;
    var existing = detail.querySelector('.dna-info');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'dna-info d-section';
    div.style.cssText = 'border-left:3px solid var(--yellow);padding-left:12px;margin-top:12px;';
    div.innerHTML = '<h4>🧬 Error DNA</h4>'
      + '<div style="font-size:11px;color:var(--fg2);line-height:1.5;">'
      + 'Seen <b>' + dna.count + '</b> times across <b>' + dna.pages.length + '</b> pages<br>'
      + 'First seen: ' + new Date(dna.firstSeen).toLocaleDateString() + '<br>'
      + 'Pages: ' + dna.pages.slice(0, 3).map(function(p) { return p.split('/').pop() || '/'; }).join(', ')
      + (dna.pages.length > 3 ? ' +' + (dna.pages.length - 3) + ' more' : '')
      + '</div>';
    detail.appendChild(div);
  });
}

// Add predictions section
function showPredictions() {
  var detail = document.getElementById('detail');
  if (!detail) return;
  var items = document.querySelectorAll('.err-item');
  var errors = [];
  items.forEach(function(item) {
    errors.push({ message: item.querySelector('.ei-msg')?.textContent || '', level: 'error' });
  });
  var preds = predictErrors(errors);
  if (preds.length === 0) return;

  var existing = detail.querySelector('.predictions');
  if (existing) existing.remove();
  var div = document.createElement('div');
  div.className = 'predictions d-section';
  div.style.cssText = 'border-left:3px solid var(--yellow);padding-left:12px;margin-top:12px;';
  var h = '<h4>🔮 Predictions</h4>';
  preds.forEach(function(p) { h += '<div style="font-size:11px;color:var(--fg2);margin:4px 0;">' + p.icon + ' ' + p.text + '</div>'; });
  div.innerHTML = h;
  detail.appendChild(div);
}

// ========== 8. ENHANCE AI CHAT WITH NATURAL LANGUAGE ==========
// Hook into the AI input to detect natural language queries
(function() {
  var origSend = window._cmOrigSendChat;
  var aiInput = document.getElementById('aiInput');
  if (!aiInput) return;

  // Override the Ask button behavior to check for NL queries first
  var aiSend = document.getElementById('aiSend');
  if (aiSend) {
    var origClick = aiSend.onclick;
    aiSend.onclick = function() {
      var text = aiInput.value.trim().toLowerCase();
      // Check if it's a natural language query about errors
      if (text.match(/^(show|how many|which|list|summarize|count|find)/)) {
        // Get errors from storage
        chrome.storage.local.get('cm_errors', function(d) {
          var store = d.cm_errors || {};
          var allErrors = [];
          Object.keys(store).forEach(function(k) { allErrors = allErrors.concat(store[k]); });
          var result = processNaturalQuery(text, allErrors);
          if (result) {
            // Show in AI chat
            if (typeof appendMsg === 'function') {
              appendMsg('user', aiInput.value.trim());
              aiInput.value = '';
              if (result.type === 'text' || result.type === 'count') {
                setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(result.text); }, 500);
              } else if (result.type === 'filtered') {
                setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(result.text + '\n\n' + result.errors.slice(0,5).map(function(e,i){return (i+1)+'. '+e.message.substring(0,60);}).join('\n')); }, 500);
              }
              return;
            }
          }
          // Not a NL query — fall through to original
          if (typeof sendAIPanelChat === 'function') sendAIPanelChat();
        });
        return;
      }
      // Not NL — use original
      if (typeof sendAIPanelChat === 'function') sendAIPanelChat();
    };
  }
})();

// ========== 9. PERIODIC UPDATES ==========
setInterval(function() {
  updateHealthScore();
}, 5000);

// Track error DNA when errors load
setInterval(function() {
  var items = document.querySelectorAll('.err-item');
  items.forEach(function(item) {
    if (item.dataset.dnaTracked) return;
    item.dataset.dnaTracked = '1';
    var msg = item.querySelector('.ei-msg');
    if (msg) trackErrorDNA({ message: msg.textContent, url: location.href });
  });
}, 5000);

// Show DNA and predictions only once per selected error (not on interval)
(function() {
  var lastShownError = '';
  var detail = document.getElementById('detail');
  if (!detail) return;

  var observer = new MutationObserver(function() {
    var msgEl = detail.querySelector('.d-msg');
    if (!msgEl) return;
    var msg = msgEl.textContent;
    if (msg === lastShownError) return; // already shown for this error
    lastShownError = msg;

    // Wait a tick for DOM to settle
    setTimeout(function() {
      showDNAInDetail();
      showPredictions();
    }, 100);
  });

  observer.observe(detail, { childList: true });
})();

// ========== 10. REGRESSION TOAST ==========
(function() {
  var lastCheck = 0;
  setInterval(function() {
    var items = document.querySelectorAll('.err-item');
    if (items.length <= lastCheck) return;
    // New error appeared
    var newest = items[0];
    if (newest && !newest.dataset.regChecked) {
      newest.dataset.regChecked = '1';
      var msg = newest.querySelector('.ei-msg');
      if (msg) {
        checkRegression({ message: msg.textContent }, function(isNew) {
          if (isNew && typeof showToast === 'function') {
            showToast('🆕 New error type detected: ' + msg.textContent.substring(0, 40), 'error');
          }
        });
      }
    }
    lastCheck = items.length;
  }, 2000);
})();

})();

