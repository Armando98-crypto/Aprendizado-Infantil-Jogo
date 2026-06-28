/**
 * Botão HTML de volume/mudo — visível em todas as cenas.
 */

const VolumeControl = (function () {
  let btn = null;

  function updateIcon() {
    if (!btn) return;
    btn.textContent = SoundSettings.isMuted() ? '🔇' : '🔊';
    btn.setAttribute('aria-label', SoundSettings.isMuted() ? 'Ativar som' : 'Desativar som');
    btn.classList.toggle('muted', SoundSettings.isMuted());
  }

  function init() {
    btn = document.getElementById('volume-btn');
    if (!btn) return;

    updateIcon();

    btn.addEventListener('click', () => {
      SoundSettings.toggle();
      updateIcon();
      if (GameAudio.getContext()) GameAudio.getContext().resume();
      if (!SoundSettings.isMuted() && typeof BgmManager !== 'undefined') {
        BgmManager.resumeAfterInteraction();
      }
    });

    SoundSettings.onChange(updateIcon);
  }

  return { init, updateIcon };
})();
