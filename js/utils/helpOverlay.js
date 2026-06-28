/**
 * Overlay HTML "Como Jogar" — visual, texto mínimo, adequado a crianças.
 */

const HelpOverlay = (function () {
  let overlay = null;
  let closeBtn = null;
  let playBtn = null;

  function init() {
    overlay = document.getElementById('help-overlay');
    closeBtn = document.getElementById('help-close');
    playBtn = document.getElementById('help-play');

    if (!overlay) return;

    closeBtn.addEventListener('click', hide);
    playBtn.addEventListener('click', hide);
    overlay.querySelector('.overlay-backdrop').addEventListener('click', hide);
  }

  function show() {
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  return { init, show, hide };
})();
