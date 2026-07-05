// ConsoleMind - AI — Advanced AI-Powered Features
// Adds: Summarizer, Smart Fix, Root Cause Grouping, Multi-language,
// Code Review, Auto-categorization, Conversational Memory, Impact Analysis
// Loaded after popup-app.js and features.js

(function() {
'use strict';

var MEMORY_KEY = 'cm_ai_memory';

// ========== 1. ERROR SUMMARIZER ==========
function summarizeErrors(errors) {
  if (!errors || errors.length === 0) return 'No errors captured in this session.';

  var errCount = errors.filter(function(e) { return e.level === 'error'; }).length;
  var warnCount = errors.filter(function(e) { return e.level === 'warning'; }).length;

  // Group by type
  var types = {};
  errors.forEach(function(e) {
    var type = (e.message || '').split(':')[0] || 'Unknown';
    if (type.length > 30) type = type.substring(0, 30);
    types[type] = (types[type] || 0) + 1;
  });
  var topTypes = Object.keys(types).sort(function(a, b) { return types[b] - types[a]; }).slice(0, 3);

  var summary = '📊 Session Summary: ' + errors.length + ' issues (' + errCount + ' errors, ' + warnCount + ' warnings).\n\n';
  summary += 'Most common: ' + topTypes.map(function(t) { return t + ' (' + types[t] + ')'; }).join(', ') + '.\n\n';

  // Identify the most critical
  var critical = errors.filter(function(e) {
    var msg = e.message || '';
    return msg.indexOf('Maximum call stack') !== -1 || msg.indexOf('Too many re-renders') !== -1 ||
           msg.indexOf('CORS') !== -1 || msg.indexOf('500') !== -1 || msg.indexOf('Unhandled Promise') !== -1;
  });
  if (critical.length > 0) {
    summary += '⚠️ ' + critical.length + ' critical issue(s) need immediate attention.';
  } else {
    summary += '✅ No critical blockers detected.';
  }
  return summary;
}

// ========== 2. SMART FIX SUGGESTIONS ==========
function generateSmartFix(err) {
  var msg = err.message || '';
  var stack = err.stack || '';
  var fixes = [];

  // Extract variable/property names from error
  var propMatch = msg.match(/reading '([^']+)'/);
  var varMatch = msg.match(/(\w+) is not defined/);
  var fnMatch = msg.match(/(\w+(?:\.\w+)*) is not a function/);

  if (propMatch) {
    var prop = propMatch[1];
    fixes.push({
      title: 'Add optional chaining',
      code: 'object?.' + prop,
      explanation: 'The property "' + prop + '" is being accessed on undefined/null. Add ?. before it.'
    });
    fixes.push({
      title: 'Add null guard',
      code: 'if (object && object.' + prop + ') { /* use it */ }',
      explanation: 'Check if the object exists before accessing "' + prop + '".'
    });
    fixes.push({
      title: 'Add default value',
      code: 'const value = object?.' + prop + ' ?? "default";',
      explanation: 'Use nullish coalescing to provide a fallback value.'
    });
  }

  if (varMatch) {
    var varName = varMatch[1];
    fixes.push({
      title: 'Import the variable',
      code: 'import { ' + varName + ' } from "./module";',
      explanation: '"' + varName + '" is not in scope. Import or declare it.'
    });
    fixes.push({
      title: 'Declare it',
      code: 'let ' + varName + ' = null; // or appropriate initial value',
      explanation: 'Declare "' + varName + '" before using it.'
    });
  }

  if (fnMatch) {
    var fn = fnMatch[1];
    fixes.push({
      title: 'Check before calling',
      code: 'if (typeof ' + fn + ' === "function") ' + fn + '();',
      explanation: '"' + fn + '" might not be a function. Guard against it.'
    });
    fixes.push({
      title: 'Check import',
      code: '// Verify: import ' + fn.split('.')[0] + ' from "correct-module"',
      explanation: 'The import might be wrong — check named vs default export.'
    });
  }

  if (msg.indexOf('CORS') !== -1) {
    fixes.push({
      title: 'Server-side fix',
      code: 'res.setHeader("Access-Control-Allow-Origin", "https://yoursite.com");',
      explanation: 'Add CORS headers on your API server.'
    });
    fixes.push({
      title: 'Proxy approach',
      code: '// In package.json: "proxy": "http://api-server.com"',
      explanation: 'Use a dev proxy to avoid CORS during development.'
    });
  }

  if (msg.indexOf('401') !== -1 || msg.indexOf('token') !== -1) {
    fixes.push({
      title: 'Refresh token',
      code: 'await refreshAuthToken(); // then retry the request',
      explanation: 'Auth token expired. Implement token refresh logic.'
    });
  }

  return fixes;
}

// ========== 3. ROOT CAUSE GROUPING ==========
function groupByRootCause(errors) {
  var groups = [];

  // Group: Auth-related cascade
  var authErrors = errors.filter(function(e) {
    return (e.message || '').match(/401|403|token|auth|unauthorized|AADSTS/i);
  });
  if (authErrors.length > 0) {
    var cascaded = errors.filter(function(e) {
      return (e.message || '').match(/undefined|null|Cannot read/i) && !authErrors.includes(e);
    });
    if (cascaded.length > 0) {
      groups.push({ cause: '🔑 Authentication Issue', root: authErrors[0], related: cascaded, total: authErrors.length + cascaded.length });
    }
  }

  // Group: Network failures
  var networkErrors = errors.filter(function(e) {
    return (e.message || '').match(/fetch|network|timeout|ERR_|CORS/i);
  });
  if (networkErrors.length >= 2) {
    groups.push({ cause: '🌐 Network/API Failures', root: networkErrors[0], related: networkErrors.slice(1), total: networkErrors.length });
  }

  // Group: React-specific
  var reactErrors = errors.filter(function(e) {
    return (e.message || '').match(/react|hook|render|component|hydration/i);
  });
  if (reactErrors.length >= 2) {
    groups.push({ cause: '⚛️ React Component Issues', root: reactErrors[0], related: reactErrors.slice(1), total: reactErrors.length });
  }

  // Group: Third-party noise
  var thirdParty = errors.filter(function(e) {
    return (e.message || '').match(/icons were re-registered|OfficeBrowserFeedback|ResizeObserver|Deprecated/i);
  });
  if (thirdParty.length > 0) {
    groups.push({ cause: '📦 Third-Party Noise (safe to ignore)', root: thirdParty[0], related: thirdParty.slice(1), total: thirdParty.length });
  }

  return groups;
}

// ========== 4. MULTI-LANGUAGE EXPLANATIONS ==========
var translations = {
  hi: { // Hindi
    whatHappened: 'क्या हुआ',
    causes: 'संभावित कारण',
    fix: 'कैसे ठीक करें',
    undefined: 'एक undefined वैल्यू पर property access करने की कोशिश की गई।',
    notFunction: 'जो function नहीं है उसे call करने की कोशिश की गई।',
    notDefined: 'एक variable जो declare नहीं हुआ उसे use करने की कोशिश की गई।',
    cors: 'Server ने आपकी website से request allow नहीं किया।'
  },
  es: { // Spanish
    whatHappened: 'Qué pasó',
    causes: 'Causas probables',
    fix: 'Cómo solucionarlo',
    undefined: 'Se intentó acceder a una propiedad de un valor undefined.',
    notFunction: 'Se intentó llamar algo que no es una función.',
    notDefined: 'Se usó una variable que no ha sido declarada.',
    cors: 'El servidor no permite solicitudes desde tu origen.'
  },
  ja: { // Japanese
    whatHappened: '何が起きたか',
    causes: '考えられる原因',
    fix: '修正方法',
    undefined: 'undefined値のプロパティにアクセスしようとしました。',
    notFunction: '関数ではないものを呼び出そうとしました。',
    notDefined: '宣言されていない変数を使用しようとしました。',
    cors: 'サーバーがあなたのオリジンからのリクエストを許可していません。'
  }
};

function getTranslatedExplanation(err, lang) {
  if (!translations[lang]) return null;
  var t = translations[lang];
  var msg = err.message || '';
  var explanation = '';

  if (msg.indexOf('undefined') !== -1 || msg.indexOf('null') !== -1) explanation = t.undefined;
  else if (msg.indexOf('not a function') !== -1) explanation = t.notFunction;
  else if (msg.indexOf('not defined') !== -1) explanation = t.notDefined;
  else if (msg.indexOf('CORS') !== -1) explanation = t.cors;
  else return null;

  return { whatHappened: t.whatHappened, causes: t.causes, fix: t.fix, explanation: explanation };
}

// ========== 5. CODE REVIEW MODE ==========
function generateCodeReview(errors) {
  var review = { score: 100, issues: [], recommendations: [] };

  var errorTypes = {};
  errors.forEach(function(e) {
    var type = categorizeError(e);
    errorTypes[type] = (errorTypes[type] || 0) + 1;
  });

  if (errorTypes['null-access'] > 3) {
    review.issues.push('🔴 Multiple null/undefined access errors — missing data validation.');
    review.recommendations.push('Add defensive coding: optional chaining (?.) and nullish coalescing (??) throughout.');
    review.score -= 15;
  }
  if (errorTypes['network'] > 2) {
    review.issues.push('🔴 Multiple network failures — no retry/error handling for API calls.');
    review.recommendations.push('Implement error boundaries and retry logic with exponential backoff.');
    review.score -= 10;
  }
  if (errorTypes['auth'] > 0) {
    review.issues.push('🟡 Authentication errors detected — token management may be broken.');
    review.recommendations.push('Add automatic token refresh and redirect to login on 401.');
    review.score -= 10;
  }
  if (errorTypes['react'] > 2) {
    review.issues.push('🟡 React rendering issues — possible performance and state problems.');
    review.recommendations.push('Review useEffect dependencies and memoize expensive computations.');
    review.score -= 8;
  }
  if (errorTypes['third-party'] > 5) {
    review.issues.push('🟢 Third-party script noise — not your code, but cluttering the console.');
    review.recommendations.push('Consider filtering third-party errors or reporting to vendor.');
    review.score -= 2;
  }
  if (errors.length === 0) {
    review.recommendations.push('✅ Clean console! No issues detected.');
  }

  review.score = Math.max(0, review.score);
  return review;
}

// ========== 6. AUTO-CATEGORIZATION ==========
function categorizeError(err) {
  var msg = (err.message || '').toLowerCase();
  var stack = (err.stack || '').toLowerCase();

  if (msg.match(/node_modules|cdn\.|googleapis|polyfill|analytics|hotjar|sentry|segment/)) return 'third-party';
  if (msg.match(/chrome-extension|moz-extension/)) return 'browser-extension';
  if (msg.match(/401|403|token|auth|aadsts|msal|login/)) return 'auth';
  if (msg.match(/cors|fetch|network|timeout|err_|xhr/)) return 'network';
  if (msg.match(/undefined|null|cannot read|cannot set/)) return 'null-access';
  if (msg.match(/react|hook|render|component|hydration|jsx/)) return 'react';
  if (msg.match(/vue|angular|svelte/)) return 'framework';
  if (msg.match(/syntax|unexpected token|unexpected end/)) return 'syntax';
  if (msg.match(/deprecated|resize.?observer|icons were re-registered/)) return 'noise';
  if (stack.match(/node_modules|vendor|chunk/)) return 'third-party';
  return 'your-code';
}

function getCategoryLabel(cat) {
  var labels = {
    'your-code': '🏠 Your Code',
    'third-party': '📦 Third-Party',
    'browser-extension': '🧩 Browser Extension',
    'auth': '🔑 Auth',
    'network': '🌐 Network',
    'null-access': '⚡ Null Access',
    'react': '⚛️ React',
    'framework': '🧱 Framework',
    'syntax': '📝 Syntax',
    'noise': '🔇 Noise'
  };
  return labels[cat] || '❓ Unknown';
}

function getCategoryColor(cat) {
  var colors = {
    'your-code': '#f87171', 'third-party': '#6b7280', 'browser-extension': '#6b7280',
    'auth': '#fbbf24', 'network': '#60a5fa', 'null-access': '#f87171',
    'react': '#38bdf8', 'framework': '#a78bfa', 'syntax': '#fb923c', 'noise': '#6b7280'
  };
  return colors[cat] || '#6b7280';
}

// ========== 7. CONVERSATIONAL MEMORY ==========
function saveToMemory(err, fix) {
  chrome.storage.local.get(MEMORY_KEY, function(d) {
    var memory = d[MEMORY_KEY] || [];
    memory.push({
      message: (err.message || '').substring(0, 100),
      fix: (fix || '').substring(0, 200),
      timestamp: Date.now(),
      url: err.url || ''
    });
    // Keep last 50 memories
    if (memory.length > 50) memory = memory.slice(-50);
    chrome.storage.local.set({ [MEMORY_KEY]: memory });
  });
}

function recallMemory(err, cb) {
  chrome.storage.local.get(MEMORY_KEY, function(d) {
    var memory = d[MEMORY_KEY] || [];
    var msg = (err.message || '').toLowerCase().substring(0, 60);
    var matches = memory.filter(function(m) {
      return m.message.toLowerCase().indexOf(msg.substring(0, 30)) !== -1;
    });
    cb(matches);
  });
}

// ========== 8. ERROR IMPACT ANALYSIS ==========
function analyzeImpact(err) {
  var msg = (err.message || '').toLowerCase();
  var impact = { level: 'low', label: '🟢 Low Impact', description: 'Cosmetic or non-blocking issue.' };

  // High impact — blocks core functionality
  if (msg.match(/401|403|auth|login|token|payment|checkout|stripe/)) {
    impact = { level: 'critical', label: '🔴 Critical — Business Impact', description: 'Blocks authentication, payments, or core user flow.' };
  } else if (msg.match(/500|503|fetch failed|network|timeout/)) {
    impact = { level: 'high', label: '🟠 High — Feature Broken', description: 'API failure — feature depending on this data won\'t work.' };
  } else if (msg.match(/maximum call stack|too many re-renders|infinite/)) {
    impact = { level: 'critical', label: '🔴 Critical — Page Crash', description: 'This error freezes/crashes the page. Immediate fix needed.' };
  } else if (msg.match(/cors|csp|blocked/)) {
    impact = { level: 'high', label: '🟠 High — Resource Blocked', description: 'Resources or API calls are being blocked by security policies.' };
  } else if (msg.match(/undefined|null|cannot read/)) {
    impact = { level: 'medium', label: '🟡 Medium — UI Broken', description: 'Part of the UI may show blank, crash, or behave incorrectly.' };
  } else if (msg.match(/deprecated|warning|resize|icons/)) {
    impact = { level: 'low', label: '🟢 Low — Cosmetic', description: 'Non-blocking warning. Won\'t affect user experience.' };
  }

  return impact;
}

// ========== INTEGRATE INTO UI ==========
// Memory recall added via MutationObserver (impact and category now in renderDetail)
(function() {
  var detail = document.getElementById('detail');
  if (!detail) return;

  var observer = new MutationObserver(function() {
    var msgEl = detail.querySelector('.d-msg');
    if (!msgEl) return;
    if (detail.querySelector('.ai-features-added')) return;

    var msg = msgEl.textContent;
    var err = { message: msg, stack: '', level: msgEl.classList.contains('error') ? 'error' : 'warning' };

    // Memory recall only (impact and category are rendered inline now)
    recallMemory(err, function(matches) {
      if (matches.length === 0) return;
      var memDiv = detail.querySelector('.memory-section');
      if (memDiv) return;
      memDiv = document.createElement('div');
      memDiv.className = 'memory-section d-section';
      memDiv.style.cssText = 'border-left:3px solid var(--blue);padding-left:12px;';
      memDiv.innerHTML = '<h4>🧠 Memory</h4><div style="font-size:11px;color:var(--fg2);">You\'ve seen this error before (' + matches.length + ' time' + (matches.length > 1 ? 's' : '') + ').<br>' +
        (matches[0].fix ? 'Last fix: <span style="color:var(--green);">' + matches[0].fix.substring(0, 80) + '</span>' : '') + '</div>';
      detail.appendChild(memDiv);
    });

    var marker = document.createElement('span');
    marker.className = 'ai-features-added';
    marker.style.display = 'none';
    detail.appendChild(marker);
  });

  observer.observe(detail, { childList: true });
})();

// Add AI suggestion buttons to the AI chat
(function() {
  var msgList = document.getElementById('aiMessages');
  if (!msgList) return;

  msgList.addEventListener('click', function(e) {
    var btn = e.target.closest('.np-chat-suggest-btn');
    if (!btn) return;
    var q = btn.dataset.q;

    // Handle special AI queries — stop event so popup-app.js doesn't also handle it
    if (q === 'summarize all errors') {
      e.stopImmediatePropagation();
      chrome.storage.local.get('cm_errors', function(d) {
        var store = d.cm_errors || {};
        var allErrors = [];
        Object.keys(store).forEach(function(k) { allErrors = allErrors.concat(store[k]); });
        var summary = summarizeErrors(allErrors);
        if (typeof appendMsg === 'function') appendMsg('user', 'Summarize all errors');
        setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(summary); }, 800);
      });
      return;
    }

    if (q === 'code review') {
      e.stopImmediatePropagation();
      chrome.storage.local.get('cm_errors', function(d) {
        var store = d.cm_errors || {};
        var allErrors = [];
        Object.keys(store).forEach(function(k) { allErrors = allErrors.concat(store[k]); });
        var review = generateCodeReview(allErrors);
        var text = '📝 Code Review (Score: ' + review.score + '/100)\n\n';
        if (review.issues.length > 0) {
          text += 'Issues:\n' + review.issues.join('\n') + '\n\n';
        }
        text += 'Recommendations:\n' + review.recommendations.join('\n');
        if (typeof appendMsg === 'function') appendMsg('user', 'Code review');
        setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(text); }, 800);
      });
      return;
    }

    if (q === 'group by root cause') {
      e.stopImmediatePropagation();
      chrome.storage.local.get('cm_errors', function(d) {
        var store = d.cm_errors || {};
        var allErrors = [];
        Object.keys(store).forEach(function(k) { allErrors = allErrors.concat(store[k]); });
        var groups = groupByRootCause(allErrors);
        var text = '';
        if (groups.length === 0) {
          text = 'No clear root cause patterns detected. Errors seem independent.';
        } else {
          text = '🔗 Root Cause Groups:\n\n';
          groups.forEach(function(g) {
            text += g.cause + ' (' + g.total + ' errors)\n';
            text += '  Root: ' + (g.root.message || '').substring(0, 60) + '\n';
            text += '  → Caused ' + g.related.length + ' downstream error(s)\n\n';
          });
        }
        if (typeof appendMsg === 'function') appendMsg('user', 'Group by root cause');
        setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(text); }, 800);
      });
      return;
    }

    if (q === 'smart fix') {
      e.stopImmediatePropagation();
      if (typeof currentAIError !== 'undefined' && currentAIError) {
        var fixes = generateSmartFix(currentAIError);
        var text = '';
        if (fixes.length === 0) {
          text = 'No specific fix generated for this error. Try asking a more specific question.';
        } else {
          text = '🔧 Smart Fix Suggestions:\n\n';
          fixes.forEach(function(f, i) {
            text += (i + 1) + '. ' + f.title + '\n   Code: ' + f.code + '\n   ' + f.explanation + '\n\n';
          });
        }
        if (typeof appendMsg === 'function') appendMsg('user', 'Smart fix for this error');
        setTimeout(function() { if (typeof typeMessage === 'function') typeMessage(text); }, 800);
      }
      return;
    }
  });
})();

// Add Summarize button only to AI chat (Code Review & Root Causes moved to Detail)
(function() {
  var suggestions = document.getElementById('aiSuggestions');
  if (!suggestions) return;
  var btn = document.createElement('button');
  btn.className = 'np-chat-suggest-btn';
  btn.dataset.q = 'summarize all errors';
  btn.textContent = '📊 Summarize';
  suggestions.appendChild(btn);
})();

// Save fix to memory when AI responds
(function() {
  var msgs = document.getElementById('aiMessages');
  if (!msgs) return;
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.classList && node.classList.contains('np-chat-msg') && !node.classList.contains('user')) {
          // Bot message added — save to memory if there's a current error
          if (typeof currentAIError !== 'undefined' && currentAIError) {
            var text = node.textContent || '';
            if (text.length > 20) saveToMemory(currentAIError, text.substring(0, 200));
          }
        }
      });
    });
  });
  observer.observe(msgs, { childList: true });
})();

// Expose functions globally for use in popup-app.js detail panel
window.generateSmartFix = generateSmartFix;
window.analyzeImpact = analyzeImpact;
window.categorizeError = categorizeError;
window.getCategoryLabel = getCategoryLabel;
window.getCategoryColor = getCategoryColor;
window.summarizeErrors = summarizeErrors;
window.generateCodeReview = generateCodeReview;
window.groupByRootCause = groupByRootCause;
window.recallMemory = recallMemory;

// Expose functions globally for natural language queries
window._cmAIFeatures = {
  summarize: summarizeErrors,
  smartFix: generateSmartFix,
  groupByRootCause: groupByRootCause,
  translate: getTranslatedExplanation,
  codeReview: generateCodeReview,
  categorize: categorizeError,
  getCategoryLabel: getCategoryLabel,
  analyzeImpact: analyzeImpact,
  recallMemory: recallMemory
};

})();
