const LanguageSelector = (function () {
  let btn = null;

  function updateBtn() {
    if (!btn) return;
    const lang = Speech.getCurrentLang();
    const langs = Speech.getAvailableLangs();
    const info = langs.find((l) => l.key === lang);
    if (info) {
      btn.textContent = `${info.flag} ${info.label}`;
    }
  }

  function init() {
    btn = document.getElementById('lang-btn');
    if (!btn) return;

    updateBtn();

    btn.addEventListener('click', () => {
      const langs = Speech.getAvailableLangs();
      const current = Speech.getCurrentLang();
      const idx = langs.findIndex((l) => l.key === current);
      const next = langs[(idx + 1) % langs.length];
      Speech.setLang(next.key);
      updateBtn();
    });

    Speech.onChange(updateBtn);
  }

  return { init, updateBtn };
})();