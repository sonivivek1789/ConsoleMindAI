// ConsoleMind — MAIN World Injector
// Intercepts ALL console output and error events, posts to content script
(function() {
  if (window.__consolemind_injected) return;
  window.__consolemind_injected = true;

  var _error = console.error;
  var _warn = console.warn;
  var _log = console.log;
  var _info = console.info;

  function post(level, msg, stack) {
    try {
      window.postMessage({ __cm: true, level: level, msg: msg, stack: stack, href: location.href, ts: Date.now() }, '*');
    } catch(e) {}
  }

  function stringify(args) {
    var out = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a instanceof Error) out.push(a.message);
      else if (typeof a === 'string') out.push(a);
      else if (a === null) out.push('null');
      else if (a === undefined) out.push('undefined');
      else { try { out.push(JSON.stringify(a)); } catch(e) { out.push(String(a)); } }
    }
    return out.join(' ').substring(0, 2000);
  }

  function extractStack(args) {
    for (var i = 0; i < args.length; i++) {
      if (args[i] instanceof Error && args[i].stack) return args[i].stack;
    }
    try { throw new Error(); } catch(e) { return e.stack || ''; }
  }

  console.error = function() {
    var msg = stringify(arguments);
    var stack = extractStack(arguments);
    post('error', msg, stack);
    return _error.apply(console, arguments);
  };

  console.warn = function() {
    var msg = stringify(arguments);
    post('warning', msg, '');
    return _warn.apply(console, arguments);
  };

  console.info = function() {
    var msg = stringify(arguments);
    if (/error|fail|exception|denied|rejected/i.test(msg)) {
      post('info', msg, '');
    }
    return _info.apply(console, arguments);
  };

  console.log = function() {
    var msg = stringify(arguments);
    if (/error|fail|exception|denied|rejected|CORS|404|500|401|403/i.test(msg)) {
      post('info', msg, '');
    }
    return _log.apply(console, arguments);
  };

  window.addEventListener('error', function(ev) {
    var msg = ev.message || 'Script error';
    var stack = (ev.error && ev.error.stack) ? ev.error.stack : (ev.filename ? ('at ' + ev.filename + ':' + ev.lineno + ':' + ev.colno) : '');
    post('error', msg, stack);
  });

  window.addEventListener('unhandledrejection', function(ev) {
    var r = ev.reason;
    var msg = r instanceof Error ? ('Unhandled Promise: ' + r.message) : ('Unhandled Promise: ' + String(r));
    var stack = r instanceof Error ? (r.stack || '') : '';
    post('error', msg, stack);
  });

  // Patch fetch to capture network errors
  var _fetch = window.fetch;
  if (_fetch) {
    window.fetch = function() {
      var url = arguments[0];
      if (typeof url === 'object' && url.url) url = url.url;
      return _fetch.apply(this, arguments).then(function(response) {
        if (!response.ok) {
          post('error', 'HTTP ' + response.status + ' ' + response.statusText + ' — ' + url, '');
        }
        return response;
      }).catch(function(err) {
        post('error', 'Fetch failed: ' + (err.message || err) + ' — ' + url, err.stack || '');
        throw err;
      });
    };
  }

  // Patch XMLHttpRequest to capture AJAX errors
  var _xhrOpen = XMLHttpRequest.prototype.open;
  var _xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._cm_url = url;
    this._cm_method = method;
    return _xhrOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    xhr.addEventListener('loadend', function() {
      if (xhr.status >= 400) {
        post('error', 'XHR ' + xhr.status + ' ' + xhr.statusText + ' — ' + (xhr._cm_method || 'GET') + ' ' + (xhr._cm_url || ''), '');
      }
    });
    xhr.addEventListener('error', function() {
      post('error', 'XHR failed — ' + (xhr._cm_method || 'GET') + ' ' + (xhr._cm_url || ''), '');
    });
    return _xhrSend.apply(this, arguments);
  };

  // Capture console.assert failures
  var _assert = console.assert;
  console.assert = function(condition) {
    if (!condition) {
      var msg = 'Assertion failed: ' + stringify(Array.prototype.slice.call(arguments, 1));
      post('error', msg, new Error().stack || '');
    }
    return _assert.apply(console, arguments);
  };

  // Capture console.trace
  var _trace = console.trace;
  console.trace = function() {
    var msg = 'Trace: ' + stringify(arguments);
    post('info', msg, new Error().stack || '');
    return _trace.apply(console, arguments);
  };
})();
