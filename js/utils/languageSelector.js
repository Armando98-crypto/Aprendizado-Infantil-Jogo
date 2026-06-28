const LanguageSelector = (function () {
  let btn = null;

  function updateBtn() {
    if (!btn) return;
    try {
      const lang = Speech.getCurrentLang();
      const langs = Speech.getAvailableLangs();
      const info = langs.find((l) => l.key === lang);
      if (info) {
        btn.textContent = info.flag + ' ' + info.label;
      }
    } catch (e) {
      console.warn('LanguageSelector.updateBtn error:', e);
    }
  }

  function init() {
    btn = document.getElementById('lang-btn');
    if (!btn) {
      console.warn('lang-btn not found in DOM');
      return;
    }

    updateBtn();

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      try {
        const langs = Speech.getAvailableLangs();
        const current = Speech.getCurrentLang();
        const idx = langs.findIndex(function (l) { return l.key === current; });
        var next = langs[(idx + 1) % langs.length];
        Speech.setLang(next.key);
        updateBtn();
      } catch (e) {
        console.warn('LanguageSelector.click error:', e);
      }
    });

    Speech.onChange(updateBtn);
  }

  return { init: init, updateBtn: updateBtn };
})();