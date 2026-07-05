// ConsoleMind — Settings Page Controller

(function() {
  var providerEl = document.getElementById('provider');
  var openaiSection = document.getElementById('openaiSection');
  var anthropicSection = document.getElementById('anthropicSection');
  var openaiKeyEl = document.getElementById('openaiKey');
  var openaiModelEl = document.getElementById('openaiModel');
  var anthropicKeyEl = document.getElementById('anthropicKey');
  var anthropicModelEl = document.getElementById('anthropicModel');
  var saveBtn = document.getElementById('saveBtn');
  var statusEl = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get('cm_ai', function(d) {
    var ai = d.cm_ai || {};
    if (ai.provider) providerEl.value = ai.provider;
    if (ai.openaiKey) openaiKeyEl.value = ai.openaiKey;
    if (ai.openaiModel) openaiModelEl.value = ai.openaiModel;
    if (ai.anthropicKey) anthropicKeyEl.value = ai.anthropicKey;
    if (ai.anthropicModel) anthropicModelEl.value = ai.anthropicModel;
    toggleSections();
  });

  // Apply theme
  chrome.storage.local.get('cm_theme', function(d) {
    if (d.cm_theme) document.body.setAttribute('data-theme', d.cm_theme);
  });

  providerEl.onchange = toggleSections;

  function toggleSections() {
    openaiSection.style.display = providerEl.value === 'openai' ? 'block' : 'none';
    anthropicSection.style.display = providerEl.value === 'anthropic' ? 'block' : 'none';
  }

  saveBtn.onclick = function() {
    var settings = {
      provider: providerEl.value,
      openaiKey: openaiKeyEl.value.trim(),
      openaiModel: openaiModelEl.value,
      anthropicKey: anthropicKeyEl.value.trim(),
      anthropicModel: anthropicModelEl.value
    };
    chrome.storage.local.set({ cm_ai: settings }, function() {
      statusEl.style.display = 'block';
      setTimeout(function() { statusEl.style.display = 'none'; }, 2000);
    });
  };
})();
